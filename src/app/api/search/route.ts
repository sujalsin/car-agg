import { NextRequest, NextResponse } from 'next/server';
import { getMakes } from '@/services/epa';
import { getYears } from '@/services/epa';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get('year');

    try {
        if (year) {
            // Get makes for a specific year
            const makes = await getMakes(parseInt(year));
            return NextResponse.json({ makes });
        } else {
            // Get available years
            const years = await getYears();
            return NextResponse.json({ years });
        }
    } catch (error) {
        console.error('Error fetching search data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch search data' },
            { status: 500 }
        );
    }
}
