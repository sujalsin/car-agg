import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Car, Calendar } from 'lucide-react';
import { POPULAR_VEHICLES } from '@/lib/seo';

interface YearPageProps {
    params: Promise<{
        year: string;
    }>;
}

export async function generateMetadata({ params }: YearPageProps): Promise<Metadata> {
    const { year } = await params;
    const yearNum = parseInt(year);
    
    return {
        title: `${yearNum} Vehicles - Reliability & Safety Data | CARAG`,
        description: `Research ${yearNum} vehicles with CARAG. View reliability scores, NHTSA complaints, safety recalls, and ownership costs for all ${yearNum} cars, trucks, and SUVs.`,
    };
}

export function generateStaticParams() {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 4; year <= currentYear + 1; year++) {
        years.push({ year: year.toString() });
    }
    return years;
}

export default async function YearPage({ params }: YearPageProps) {
    const { year } = await params;
    const yearNum = parseInt(year);
    
    // Validate year
    const currentYear = new Date().getFullYear();
    if (isNaN(yearNum) || yearNum < 1990 || yearNum > currentYear + 1) {
        notFound();
    }
    
    // Get makes for this year from popular vehicles
    const makesForYear = [...new Set(
        POPULAR_VEHICLES
            .filter(v => v.year === yearNum)
            .map(v => v.make)
    )];
    
    return (
        <div className="min-h-screen bg-background">
            <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Link>
                    <span className="font-bold flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {yearNum} Vehicles
                    </span>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-bold mb-4">
                    {yearNum} Vehicle Research
                </h1>
                <p className="text-muted-foreground mb-8">
                    Browse reliability data, safety ratings, and ownership costs for {yearNum} vehicles.
                </p>

                {makesForYear.length > 0 ? (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold">Popular Makes</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {makesForYear.map(make => (
                                <Link
                                    key={make}
                                    href={`/vehicle/${year}/${encodeURIComponent(make)}`}
                                    className="flex items-center gap-3 p-4 bg-card border rounded-lg hover:border-primary transition-colors"
                                >
                                    <Car className="w-5 h-5 text-muted-foreground" />
                                    <span className="font-medium">{make}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 bg-muted/30 rounded-xl">
                        <p className="text-muted-foreground">
                            Vehicle data for {yearNum} is being updated. Check back soon!
                        </p>
                    </div>
                )}

                <div className="mt-12 p-6 bg-muted/30 rounded-xl">
                    <h2 className="font-semibold mb-3">Search for a Specific Vehicle</h2>
                    <p className="text-muted-foreground mb-4">
                        Use our search tool to find any {yearNum} vehicle by make and model.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                        Search Vehicles
                    </Link>
                </div>
            </div>
        </div>
    );
}
