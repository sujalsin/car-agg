import { NextRequest, NextResponse } from 'next/server';
import { getComplaints, getRecalls } from '@/services/nhtsa';
import { getVehicles, getRealWorldMPG, getFuelPrices } from '@/services/epa';
import { searchCarReviews, getVideoDetails } from '@/services/youtube';
import { calculateReliabilityScore } from '@/lib/reliability-score';
import { calculateOwnershipCost } from '@/lib/ownership-cost';
import { aggregateCommonProblems, generateProsAndCons, CommonProblem, ProsConsSummary } from '@/lib/common-problems';
import { 
    checkRateLimit, 
    getRateLimitHeaders, 
    createRateLimitResponse,
    getClientIP,
    RATE_LIMITS 
} from '@/lib/rate-limit';

export interface VehicleData {
    year: number;
    make: string;
    model: string;
    variants: Array<{
        id: string;
        trim: string;
        engine: string;
        transmission: string;
        drivetrain: string;
        fuelType: string;
        cityMpg: number;
        highwayMpg: number;
        combinedMpg: number;
        realWorldMpg: number | null;
        realWorldSampleSize: number | null;
        msrp: number | null;
        co2Emissions: number | null;
    }>;
    reliabilityScore: {
        overall: number;
        components: Array<{
            category: string;
            score: number;
            complaintCount: number;
            issues: string[];
        }>;
        complaintCount: number;
        recallCount: number;
        severityBreakdown: {
            critical: number;
            major: number;
            minor: number;
        };
        lemonYearRisk: 'low' | 'moderate' | 'high';
    };
    complaints: Array<{
        id: string;
        date: string;
        component: string;
        summary: string;
        crash: boolean;
        fire: boolean;
        injuries: number;
        deaths: number;
    }>;
    recalls: Array<{
        campaignNumber: string;
        date: string;
        component: string;
        summary: string;
        consequence: string;
        remedy: string;
    }>;
    ownershipCost: {
        totalAnnualCost: number;
        fuelCost: number;
        insuranceCost: number;
        maintenanceCost: number;
        repairCost: number;
        depreciation: number;
        fiveYearCost: number;
        msrp: number;
        details?: {
            fuelPrice: number;
            fuelType: string;
            annualMiles: number;
            stateInsuranceAverage: number;
            depreciationRate: number;
            vehicleRetainedValue: number;
        };
    } | null;
    youtubeVideos: Array<{
        id: string;
        title: string;
        channelName: string;
        thumbnail: string;
        viewCount: number;
        publishedAt: string;
        duration: string;
    }>;
    commonProblems: CommonProblem[];
    prosAndCons: ProsConsSummary;
}

export async function GET(request: NextRequest) {
    // Check rate limit
    const clientIP = getClientIP(request);
    const rateLimitKey = `vehicles:${clientIP}`;
    const rateLimitResult = checkRateLimit(rateLimitKey, RATE_LIMITS.vehicles);
    
    if (!rateLimitResult.allowed) {
        return createRateLimitResponse(rateLimitResult.resetTime);
    }

    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get('year');
    const make = searchParams.get('make');
    const model = searchParams.get('model');

    if (!year || !make || !model) {
        return NextResponse.json(
            { error: 'Missing required parameters: year, make, model' },
            { 
                status: 400,
                headers: getRateLimitHeaders(
                    RATE_LIMITS.vehicles.limit,
                    rateLimitResult.remaining,
                    rateLimitResult.resetTime
                ),
            }
        );
    }

    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 1980 || yearNum > new Date().getFullYear() + 1) {
        return NextResponse.json(
            { error: 'Invalid year' },
            { 
                status: 400,
                headers: getRateLimitHeaders(
                    RATE_LIMITS.vehicles.limit,
                    rateLimitResult.remaining,
                    rateLimitResult.resetTime
                ),
            }
        );
    }

    try {
        // Check cache first
        const { getCachedVehicleData, cacheVehicleData } = await import('@/services/cache');
        const cachedData = await getCachedVehicleData(yearNum, make, model);

        if (cachedData) {
            console.log(`Cache HIT for ${yearNum} ${make} ${model}`);
            return NextResponse.json(cachedData, {
                headers: getRateLimitHeaders(
                    RATE_LIMITS.vehicles.limit,
                    rateLimitResult.remaining,
                    rateLimitResult.resetTime
                ),
            });
        }

        console.log(`Cache MISS for ${yearNum} ${make} ${model} - fetching fresh data`);

        // Normalize make name for EPA (title case)
        const normalizedMake = make.charAt(0).toUpperCase() + make.slice(1).toLowerCase();

        // Fetch data from all sources in parallel
        const [complaints, recalls, epaVehicles, fuelPrices, youtubeResults] = await Promise.all([
            getComplaints(yearNum, make, model),
            getRecalls(yearNum, make, model),
            getVehicles(yearNum, normalizedMake, model),
            getFuelPrices(),
            searchCarReviews(yearNum, make, model, 10),
        ]);

        // Calculate reliability score
        const reliabilityScore = calculateReliabilityScore(complaints, recalls);

        // Get real-world MPG for each variant
        const variantsWithRealMpg = await Promise.all(
            epaVehicles.map(async (vehicle) => {
                const realMpg = await getRealWorldMPG(vehicle.id);
                return {
                    id: vehicle.id,
                    trim: vehicle.trany || 'Base',
                    engine: `${vehicle.cylinders}cyl ${vehicle.displ}L`,
                    transmission: vehicle.trany,
                    drivetrain: vehicle.drive,
                    fuelType: vehicle.fuelType,
                    cityMpg: vehicle.city08,
                    highwayMpg: vehicle.highway08,
                    combinedMpg: vehicle.comb08,
                    realWorldMpg: realMpg?.avgMpg || null,
                    realWorldSampleSize: realMpg?.vehicleCount || null,
                    msrp: null, // EPA doesn't provide MSRP
                    co2Emissions: vehicle.co2TailpipeGpm,
                    vehicleClass: vehicle.VClass,
                };
            })
        );

        // Calculate ownership cost for the first variant
        let ownershipCost = null;
        if (variantsWithRealMpg.length > 0) {
            const firstVariant = variantsWithRealMpg[0];
            ownershipCost = calculateOwnershipCost(
                {
                    // MSRP will be estimated by the function based on vehicle details
                    combinedMpg: firstVariant.combinedMpg,
                    fuelType: firstVariant.fuelType.toLowerCase().includes('premium')
                        ? 'premium'
                        : firstVariant.fuelType.toLowerCase().includes('diesel')
                            ? 'diesel'
                            : firstVariant.fuelType.toLowerCase().includes('electric')
                                ? 'electric'
                                : 'regular',
                    vehicleClass: firstVariant.vehicleClass || 'Midsize Cars',
                    year: yearNum,
                    make: normalizedMake,
                    model,
                    complaintRate: (complaints.length / 50000) * 10000, // Normalize to per 10k
                    trim: firstVariant.trim,
                },
                fuelPrices
            );
        }

        // Get video details for YouTube results
        const videoIds = youtubeResults.map((v) => v.videoId);
        const videoDetails = videoIds.length > 0 ? await getVideoDetails(videoIds) : [];

        // Format response
        const response: VehicleData = {
            year: yearNum,
            make,
            model,
            variants: variantsWithRealMpg,
            reliabilityScore,
            complaints: complaints.slice(0, 50).map((c) => ({
                id: c.odiNumber,
                date: c.dateComplaintFiled,
                component: c.components,
                summary: c.summary,
                crash: c.crash === 'Y',
                fire: c.fire === 'Y',
                injuries: c.numberOfInjuries,
                deaths: c.numberOfDeaths,
            })),
            recalls: recalls.map((r) => ({
                campaignNumber: r.nhtsaCampaignNumber,
                date: r.reportReceivedDate,
                component: r.component,
                summary: r.summary,
                consequence: r.consequence,
                remedy: r.remedy,
            })),
            ownershipCost,
            youtubeVideos: videoDetails.slice(0, 10).map((v) => ({
                id: v.id,
                title: v.title,
                channelName: v.channelTitle,
                thumbnail: v.thumbnailUrl,
                viewCount: v.viewCount,
                publishedAt: v.publishedAt,
                duration: v.duration,
            })),
            commonProblems: aggregateCommonProblems(complaints),
            prosAndCons: generateProsAndCons(
                reliabilityScore.overall,
                complaints.length,
                recalls.length,
                variantsWithRealMpg[0]?.combinedMpg || null,
                aggregateCommonProblems(complaints)
            ),
        };

        // Cache the response for future requests
        cacheVehicleData(yearNum, make, model, response).catch(err =>
            console.error('Failed to cache vehicle data:', err)
        );

        return NextResponse.json(response, {
            headers: getRateLimitHeaders(
                RATE_LIMITS.vehicles.limit,
                rateLimitResult.remaining,
                rateLimitResult.resetTime
            ),
        });
    } catch (error) {
        console.error('Error fetching vehicle data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch vehicle data' },
            { 
                status: 500,
                headers: getRateLimitHeaders(
                    RATE_LIMITS.vehicles.limit,
                    rateLimitResult.remaining,
                    rateLimitResult.resetTime
                ),
            }
        );
    }
}
