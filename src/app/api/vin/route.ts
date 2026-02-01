import { NextResponse } from 'next/server';
import { decodeVIN } from '@/services/nhtsa';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const vin = searchParams.get('vin');

    if (!vin) {
        return NextResponse.json({ error: 'VIN is required' }, { status: 400 });
    }

    // Validate VIN format (17 characters, alphanumeric, no I, O, Q)
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
    if (!vinRegex.test(vin)) {
        return NextResponse.json({
            error: 'Invalid VIN format. VIN must be 17 characters (letters and numbers, excluding I, O, Q)'
        }, { status: 400 });
    }

    try {
        const vehicleSpec = await decodeVIN(vin.toUpperCase());

        if (!vehicleSpec || !vehicleSpec.make || !vehicleSpec.year) {
            return NextResponse.json({
                error: 'Could not decode VIN. Please check the VIN and try again.'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            vehicle: vehicleSpec,
            vin: vin.toUpperCase(),
        });
    } catch (error) {
        console.error('VIN decode error:', error);
        return NextResponse.json({
            error: 'Failed to decode VIN. Please try again.'
        }, { status: 500 });
    }
}
