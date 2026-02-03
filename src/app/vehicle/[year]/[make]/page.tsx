import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Car, ChevronRight } from 'lucide-react';
import { POPULAR_VEHICLES } from '@/lib/seo';

interface MakePageProps {
    params: Promise<{
        year: string;
        make: string;
    }>;
}

export async function generateMetadata({ params }: MakePageProps): Promise<Metadata> {
    const { year, make } = await params;
    const yearNum = parseInt(year);
    const decodedMake = decodeURIComponent(make);
    
    return {
        title: `${yearNum} ${decodedMake} Models - Reliability & Reviews | CARAG`,
        description: `Research ${yearNum} ${decodedMake} vehicles with CARAG. View reliability scores, NHTSA complaints, safety recalls, fuel economy, and ownership costs.`,
    };
}

export function generateStaticParams() {
    const params: Array<{ year: string; make: string }> = [];
    
    for (const vehicle of POPULAR_VEHICLES) {
        params.push({
            year: vehicle.year.toString(),
            make: encodeURIComponent(vehicle.make),
        });
    }
    
    // Remove duplicates
    return params.filter((v, i, a) => 
        a.findIndex(t => t.year === v.year && t.make === v.make) === i
    );
}

export default async function MakePage({ params }: MakePageProps) {
    const { year, make } = await params;
    const yearNum = parseInt(year);
    const decodedMake = decodeURIComponent(make);
    
    // Validate year
    const currentYear = new Date().getFullYear();
    if (isNaN(yearNum) || yearNum < 1990 || yearNum > currentYear + 1) {
        notFound();
    }
    
    // Get models for this year and make
    const modelsForMake = POPULAR_VEHICLES
        .filter(v => v.year === yearNum && v.make.toLowerCase() === decodedMake.toLowerCase())
        .map(v => v.model);
    
    return (
        <div className="min-h-screen bg-background">
            <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
                    <Link href={`/vehicle/${year}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Link>
                    <span className="font-bold flex items-center gap-2">
                        <Car className="w-4 h-4" />
                        {decodedMake}
                    </span>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-bold mb-2">
                    {yearNum} {decodedMake}
                </h1>
                <p className="text-muted-foreground mb-8">
                    Browse {yearNum} {decodedMake} models. View reliability data, safety ratings, and ownership costs.
                </p>

                {modelsForMake.length > 0 ? (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold">Available Models</h2>
                        <div className="space-y-3">
                            {modelsForMake.map(model => (
                                <Link
                                    key={model}
                                    href={`/vehicle/${year}/${encodeURIComponent(decodedMake)}/${encodeURIComponent(model)}`}
                                    className="flex items-center justify-between p-4 bg-card border rounded-lg hover:border-primary transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <Car className="w-5 h-5 text-muted-foreground" />
                                        <div>
                                            <span className="font-medium">{yearNum} {decodedMake} {model}</span>
                                            <p className="text-sm text-muted-foreground">
                                                View reliability, safety, and cost data
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                                </Link>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 bg-muted/30 rounded-xl">
                        <p className="text-muted-foreground">
                            No {decodedMake} models found for {yearNum}. Check back soon!
                        </p>
                    </div>
                )}

                <div className="mt-8 flex gap-4">
                    <Link
                        href={`/vehicle/${year}`}
                        className="text-sm text-muted-foreground hover:text-foreground"
                    >
                        ← All {yearNum} vehicles
                    </Link>
                    <span className="text-muted-foreground">•</span>
                    <Link
                        href="/"
                        className="text-sm text-muted-foreground hover:text-foreground"
                    >
                        Search all years
                    </Link>
                </div>
            </div>
        </div>
    );
}
