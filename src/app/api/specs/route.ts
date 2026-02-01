import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import {
    getSpecsFromVIN,
    SAMPLE_VINS,
    SPEC_CATEGORIES,
    SPEC_LABELS,
    formatSpecValue
} from '@/services/manufacturer-specs';

const NHTSA_BASE = 'https://vpic.nhtsa.dot.gov/api/vehicles';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get('year');
    const make = searchParams.get('make');
    const model = searchParams.get('model');
    const vin = searchParams.get('vin');

    // If VIN provided, decode it directly
    if (vin) {
        const specs = await getSpecsFromVIN(vin);
        if (specs) {
            return NextResponse.json({
                success: true,
                source: 'NHTSA VIN Decode',
                specs,
                categories: SPEC_CATEGORIES,
                labels: SPEC_LABELS,
            });
        }
        return NextResponse.json({ error: 'VIN decode failed' }, { status: 404 });
    }

    // Get specs for year/make/model
    if (year && make && model) {
        const yearNum = parseInt(year);
        const makeUpper = make.toUpperCase();
        const modelNorm = model.replace(/%20/g, ' ');

        // First, try to get sample VIN for this vehicle
        const makeSamples = SAMPLE_VINS[make] || SAMPLE_VINS[makeUpper] || {};
        const modelSamples = makeSamples[model] || makeSamples[modelNorm] || {};
        const sampleVIN = modelSamples[year];

        let baseSpecs = null;

        if (sampleVIN) {
            // Use sample VIN to get base specs
            baseSpecs = await getSpecsFromVIN(sampleVIN);
        }

        // Get all variants from EPA for this vehicle
        try {
            const normalizedMake = make.charAt(0).toUpperCase() + make.slice(1).toLowerCase();

            const epaResponse = await axios.get(
                `https://www.fueleconomy.gov/ws/rest/vehicle/menu/options?year=${yearNum}&make=${encodeURIComponent(normalizedMake)}&model=${encodeURIComponent(modelNorm)}`,
                { headers: { Accept: 'application/json' }, timeout: 10000 }
            );

            let options = epaResponse.data?.menuItem || [];
            if (!Array.isArray(options)) options = options ? [options] : [];

            // Get detailed specs for each variant
            const variantDetails = await Promise.all(
                options.slice(0, 8).map(async (opt: any) => {
                    try {
                        const detailResponse = await axios.get(
                            `https://www.fueleconomy.gov/ws/rest/vehicle/${opt.value}`,
                            { headers: { Accept: 'application/json' }, timeout: 5000 }
                        );
                        const v = detailResponse.data;
                        return {
                            id: v.id,
                            name: opt.text || v.trany,
                            engine: `${v.cylinders || '?'} cyl ${v.displ || '?'}L`,
                            cylinders: v.cylinders,
                            displacement: v.displ,
                            transmission: v.trany,
                            transmissionType: v.trans_dscr,
                            drivetrain: v.drive,
                            fuelType: v.fuelType || v.fuelType1,
                            cityMpg: v.city08,
                            highwayMpg: v.highway08,
                            combinedMpg: v.comb08,
                            annualFuelCost: v.fuelCost08,
                            co2Emissions: v.co2TailpipeGpm,
                            vehicleClass: v.VClass,
                            startStopTech: v.startStop === 'Y',
                            turbo: v.tCharger === 'T',
                            supercharger: v.sCharger === 'S',
                            evMotor: v.evMotor,
                            range: v.range,
                            phevBlended: v.phevBlended === 'true',
                        };
                    } catch {
                        return null;
                    }
                })
            );

            const variants = variantDetails.filter(v => v !== null);

            // Aggregate unique specs across variants
            const aggregatedSpecs = {
                year: yearNum,
                make: normalizedMake,
                model: modelNorm,
                vehicleClass: variants[0]?.vehicleClass || '',
                engines: [...new Set(variants.map(v => v?.engine).filter(Boolean))],
                drivetrains: [...new Set(variants.map(v => v?.drivetrain).filter(Boolean))],
                transmissions: [...new Set(variants.map(v => v?.transmission).filter(Boolean))],
                fuelTypes: [...new Set(variants.map(v => v?.fuelType).filter(Boolean))],
                mpgRange: {
                    city: {
                        min: Math.min(...variants.map(v => v?.cityMpg || 999).filter(n => n < 999)),
                        max: Math.max(...variants.map(v => v?.cityMpg || 0)),
                    },
                    highway: {
                        min: Math.min(...variants.map(v => v?.highwayMpg || 999).filter(n => n < 999)),
                        max: Math.max(...variants.map(v => v?.highwayMpg || 0)),
                    },
                    combined: {
                        min: Math.min(...variants.map(v => v?.combinedMpg || 999).filter(n => n < 999)),
                        max: Math.max(...variants.map(v => v?.combinedMpg || 0)),
                    },
                },
                hasTurbo: variants.some(v => v?.turbo),
                hasSupercharger: variants.some(v => v?.supercharger),
                hasStartStop: variants.some(v => v?.startStopTech),
                isEV: variants.some(v => v?.evMotor),
                isPHEV: variants.some(v => v?.phevBlended),
            };

            return NextResponse.json({
                success: true,
                source: 'EPA FuelEconomy.gov + NHTSA',
                baseSpecs, // From VIN decode if available
                aggregatedSpecs,
                variants,
                categories: SPEC_CATEGORIES,
                labels: SPEC_LABELS,
            });
        } catch (error) {
            console.error('Specs fetch error:', error);

            // Return base specs only if we have them
            if (baseSpecs) {
                return NextResponse.json({
                    success: true,
                    source: 'NHTSA VIN Decode',
                    baseSpecs,
                    variants: [],
                    categories: SPEC_CATEGORIES,
                    labels: SPEC_LABELS,
                });
            }

            return NextResponse.json({
                error: 'Unable to fetch specifications',
                message: 'No data available for this vehicle'
            }, { status: 404 });
        }
    }

    return NextResponse.json(
        { error: 'Please provide year, make, and model parameters' },
        { status: 400 }
    );
}
