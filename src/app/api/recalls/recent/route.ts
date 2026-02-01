import { NextResponse } from 'next/server';
import { getRecentRecalls } from '@/services/nhtsa';

export async function GET() {
    try {
        // Fetch recent recalls from NHTSA
        const recalls = await getRecentRecalls(10);

        // Format for the banner
        const formattedRecalls = recalls.map(recall => ({
            make: recall.make,
            model: recall.model,
            year: recall.modelYear,
            component: recall.component.split(',')[0].trim().slice(0, 30),
            date: new Date(recall.reportReceivedDate).getFullYear().toString(),
        }));

        return NextResponse.json({ recalls: formattedRecalls });
    } catch (error) {
        console.error('Error fetching recent recalls:', error);

        // Return fallback data
        return NextResponse.json({
            recalls: [
                { make: 'Honda', model: 'CR-V', year: '2023-2024', component: 'Fuel Pump', date: '2024' },
                { make: 'Toyota', model: 'RAV4', year: '2022-2023', component: 'Suspension', date: '2024' },
                { make: 'Ford', model: 'F-150', year: '2021-2023', component: 'Engine', date: '2024' },
                { make: 'Tesla', model: 'Model Y', year: '2020-2024', component: 'Steering', date: '2024' },
                { make: 'Hyundai', model: 'Tucson', year: '2022-2024', component: 'Airbags', date: '2024' },
            ]
        });
    }
}
