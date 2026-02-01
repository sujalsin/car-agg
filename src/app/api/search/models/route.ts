import { NextRequest, NextResponse } from 'next/server';
import { getModels } from '@/services/epa';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get('year');
    const make = searchParams.get('make');

    if (!year || !make) {
        return NextResponse.json(
            { error: 'Missing required parameters: year, make' },
            { status: 400 }
        );
    }

    try {
        const models = await getModels(parseInt(year), make);
        return NextResponse.json({ models });
    } catch (error) {
        console.error('Error fetching models:', error);
        return NextResponse.json(
            { error: 'Failed to fetch models' },
            { status: 500 }
        );
    }
}
