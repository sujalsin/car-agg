import { NextRequest, NextResponse } from 'next/server';
import { getComplaints, getRecalls } from '@/services/nhtsa';
import { getVehicles, getRealWorldMPG, getFuelPrices } from '@/services/epa';
import { calculateReliabilityScore } from '@/lib/reliability-score';
import { calculateOwnershipCost } from '@/lib/ownership-cost';
import { aggregateCommonProblems, generateProsAndCons } from '@/lib/common-problems';
import { 
    checkRateLimit, 
    getRateLimitHeaders, 
    createRateLimitResponse,
    getClientIP,
    RATE_LIMITS 
} from '@/lib/rate-limit';

interface CompareVehicle {
    year: number;
    make: string;
    model: string;
}

export async function POST(request: NextRequest) {
    // Check rate limit
    const clientIP = getClientIP(request);
    const rateLimitKey = `compare:${clientIP}`;
    const rateLimitResult = checkRateLimit(rateLimitKey, RATE_LIMITS.compare);
    
    if (!rateLimitResult.allowed) {
        return createRateLimitResponse(rateLimitResult.resetTime);
    }

    try {
        const body = await request.json();
        const vehicles: CompareVehicle[] = body.vehicles;

        if (!vehicles || !Array.isArray(vehicles) || vehicles.length < 2 || vehicles.length > 3) {
            return NextResponse.json(
                { error: 'Please provide 2-3 vehicles to compare' },
                { 
                    status: 400,
                    headers: getRateLimitHeaders(
                        RATE_LIMITS.compare.limit,
                        rateLimitResult.remaining,
                        rateLimitResult.resetTime
                    ),
                }
            );
        }

        // Fetch data for all vehicles in parallel
        const vehicleData = await Promise.all(
            vehicles.map(async (v) => {
                const normalizedMake = v.make.charAt(0).toUpperCase() + v.make.slice(1).toLowerCase();

                const [complaints, recalls, epaVehicles, fuelPrices] = await Promise.all([
                    getComplaints(v.year, v.make, v.model),
                    getRecalls(v.year, v.make, v.model),
                    getVehicles(v.year, normalizedMake, v.model),
                    getFuelPrices(),
                ]);

                const reliabilityScore = calculateReliabilityScore(complaints, recalls);

                // Get first variant MPG
                let combinedMpg: number | null = null;
                let cityMpg: number | null = null;
                let highwayMpg: number | null = null;
                let fuelType = 'Regular';

                if (epaVehicles.length > 0) {
                    combinedMpg = epaVehicles[0].comb08;
                    cityMpg = epaVehicles[0].city08;
                    highwayMpg = epaVehicles[0].highway08;
                    fuelType = epaVehicles[0].fuelType || 'Regular';
                }

                // Calculate ownership cost
                let ownershipCost = null;
                if (combinedMpg) {
                    ownershipCost = calculateOwnershipCost(
                        {
                            combinedMpg,
                            fuelType: fuelType.toLowerCase().includes('premium') ? 'premium' : 'regular',
                            vehicleClass: epaVehicles[0]?.VClass || 'Midsize Cars',
                            year: v.year,
                            make: normalizedMake,
                            model: v.model,
                            complaintRate: (complaints.length / 50000) * 10000,
                        },
                        fuelPrices
                    );
                }

                const commonProblems = aggregateCommonProblems(complaints);
                const prosAndCons = generateProsAndCons(
                    reliabilityScore.overall,
                    complaints.length,
                    recalls.length,
                    combinedMpg,
                    commonProblems
                );

                return {
                    year: v.year,
                    make: v.make,
                    model: v.model,
                    reliabilityScore: reliabilityScore.overall,
                    complaintCount: complaints.length,
                    recallCount: recalls.length,
                    cityMpg,
                    highwayMpg,
                    combinedMpg,
                    fuelType,
                    annualFuelCost: ownershipCost?.fuelCost || null,
                    totalAnnualCost: ownershipCost?.totalAnnualCost || null,
                    fiveYearCost: ownershipCost?.fiveYearCost || null,
                    verdict: prosAndCons.verdict,
                    topProblems: commonProblems.slice(0, 3).map(p => p.component),
                    severityBreakdown: reliabilityScore.severityBreakdown,
                };
            })
        );

        return NextResponse.json({
            success: true,
            vehicles: vehicleData,
            comparedAt: new Date().toISOString(),
        }, {
            headers: getRateLimitHeaders(
                RATE_LIMITS.compare.limit,
                rateLimitResult.remaining,
                rateLimitResult.resetTime
            ),
        });
    } catch (error) {
        console.error('Comparison error:', error);
        return NextResponse.json(
            { error: 'Failed to compare vehicles' },
            { 
                status: 500,
                headers: getRateLimitHeaders(
                    RATE_LIMITS.compare.limit,
                    rateLimitResult.remaining,
                    rateLimitResult.resetTime
                ),
            }
        );
    }
}
