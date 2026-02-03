'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Plus,
    X,
    Scale,
    Fuel,
    DollarSign,
    AlertTriangle,
    Shield,
    Search,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScoreGauge } from '@/components/ScoreGauge';

interface VehicleInput {
    id: string;
    year: string;
    make: string;
    model: string;
}

interface ComparedVehicle {
    year: number;
    make: string;
    model: string;
    reliabilityScore: number;
    complaintCount: number;
    recallCount: number;
    cityMpg: number | null;
    highwayMpg: number | null;
    combinedMpg: number | null;
    fuelType: string;
    annualFuelCost: number | null;
    totalAnnualCost: number | null;
    fiveYearCost: number | null;
    verdict: 'recommended' | 'caution' | 'avoid';
    topProblems: string[];
    severityBreakdown: {
        critical: number;
        major: number;
        minor: number;
    };
}

export default function ComparePage() {
    const router = useRouter();
    const [vehicles, setVehicles] = useState<VehicleInput[]>([
        { id: '1', year: '', make: '', model: '' },
        { id: '2', year: '', make: '', model: '' },
    ]);
    const [results, setResults] = useState<ComparedVehicle[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const addVehicle = () => {
        if (vehicles.length < 3) {
            setVehicles([...vehicles, { id: Date.now().toString(), year: '', make: '', model: '' }]);
        }
    };

    const removeVehicle = (id: string) => {
        if (vehicles.length > 2) {
            setVehicles(vehicles.filter(v => v.id !== id));
        }
    };

    const updateVehicle = (id: string, field: keyof VehicleInput, value: string) => {
        setVehicles(vehicles.map(v =>
            v.id === id ? { ...v, [field]: value } : v
        ));
    };

    const handleCompare = async () => {
        const validVehicles = vehicles.filter(v => v.year && v.make && v.model);
        if (validVehicles.length < 2) {
            setError('Please enter at least 2 vehicles to compare');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/compare', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vehicles: validVehicles.map(v => ({
                        year: parseInt(v.year),
                        make: v.make,
                        model: v.model,
                    })),
                }),
            });

            const data = await response.json();
            if (data.success) {
                setResults(data.vehicles);
            } else {
                setError(data.error || 'Failed to compare vehicles');
            }
        } catch (err) {
            setError('Failed to compare vehicles. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getVerdictColor = (verdict: string) => {
        switch (verdict) {
            case 'recommended': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'caution': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'avoid': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    const getBestValue = (values: (number | null)[], higherIsBetter: boolean = true) => {
        const validValues = values.filter((v): v is number => v !== null);
        if (validValues.length === 0) return null;
        return higherIsBetter ? Math.max(...validValues) : Math.min(...validValues);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </Link>
                        <div className="flex items-center gap-2">
                            <Scale className="w-5 h-5 text-blue-500" />
                            <span className="font-bold">Vehicle Comparison</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Vehicle Input Section */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold mb-2">Compare Vehicles</h1>
                    <p className="text-muted-foreground mb-6">Enter 2-3 vehicles to compare reliability, fuel economy, and costs</p>

                    <div className="grid gap-4 md:grid-cols-3">
                        {vehicles.map((vehicle, index) => (
                            <div key={vehicle.id} className="bg-card border rounded-xl p-4 relative">
                                {vehicles.length > 2 && (
                                    <button
                                        onClick={() => removeVehicle(vehicle.id)}
                                        className="absolute top-2 right-2 p-1 hover:bg-muted rounded"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                                <h3 className="font-semibold mb-3">Vehicle {index + 1}</h3>
                                <div className="space-y-3">
                                    <input
                                        type="number"
                                        placeholder="Year (e.g., 2024)"
                                        value={vehicle.year}
                                        onChange={(e) => updateVehicle(vehicle.id, 'year', e.target.value)}
                                        className="w-full h-10 px-3 rounded-lg border bg-background text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Make (e.g., Toyota)"
                                        value={vehicle.make}
                                        onChange={(e) => updateVehicle(vehicle.id, 'make', e.target.value)}
                                        className="w-full h-10 px-3 rounded-lg border bg-background text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Model (e.g., Camry)"
                                        value={vehicle.model}
                                        onChange={(e) => updateVehicle(vehicle.id, 'model', e.target.value)}
                                        className="w-full h-10 px-3 rounded-lg border bg-background text-sm"
                                    />
                                </div>
                            </div>
                        ))}

                        {vehicles.length < 3 && (
                            <button
                                onClick={addVehicle}
                                className="border-2 border-dashed rounded-xl p-4 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                Add Vehicle
                            </button>
                        )}
                    </div>

                    <button
                        onClick={handleCompare}
                        disabled={loading}
                        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Comparing...
                            </>
                        ) : (
                            <>
                                <Scale className="w-5 h-5" />
                                Compare Vehicles
                            </>
                        )}
                    </button>

                    {error && (
                        <p className="mt-4 text-red-500 text-sm">{error}</p>
                    )}
                </div>

                {/* Results Section */}
                {results && (
                    <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid gap-4 md:grid-cols-3">
                            {results.map((v, i) => (
                                <div key={i} className="bg-card border rounded-xl p-6 text-center">
                                    <h3 className="font-bold text-lg mb-2">{v.year} {v.make} {v.model}</h3>
                                    <div className="flex justify-center mb-3">
                                        <ScoreGauge score={v.reliabilityScore} size="lg" />
                                    </div>
                                    <span className={cn(
                                        'px-3 py-1 rounded-full text-xs font-bold',
                                        getVerdictColor(v.verdict)
                                    )}>
                                        {v.verdict === 'recommended' && 'Recommended'}
                                        {v.verdict === 'caution' && 'Proceed with Caution'}
                                        {v.verdict === 'avoid' && 'Not Recommended'}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Comparison Table */}
                        <div className="bg-card border rounded-xl overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="text-left p-4 font-semibold">Metric</th>
                                        {results.map((v, i) => (
                                            <th key={i} className="text-center p-4 font-semibold">
                                                {v.year} {v.make} {v.model}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {/* Reliability */}
                                    <tr>
                                        <td className="p-4 flex items-center gap-2">
                                            <Shield className="w-4 h-4 text-green-500" />
                                            Reliability Score
                                        </td>
                                        {results.map((v, i) => {
                                            const best = getBestValue(results.map(r => r.reliabilityScore));
                                            return (
                                                <td key={i} className={cn(
                                                    "text-center p-4 font-semibold",
                                                    v.reliabilityScore === best && "text-green-600 dark:text-green-400"
                                                )}>
                                                    {v.reliabilityScore.toFixed(1)}/10
                                                    {v.reliabilityScore === best && " ⭐"}
                                                </td>
                                            );
                                        })}
                                    </tr>

                                    {/* Complaints */}
                                    <tr>
                                        <td className="p-4 flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                                            NHTSA Complaints
                                        </td>
                                        {results.map((v, i) => {
                                            const best = getBestValue(results.map(r => r.complaintCount), false);
                                            return (
                                                <td key={i} className={cn(
                                                    "text-center p-4 font-semibold",
                                                    v.complaintCount === best && "text-green-600 dark:text-green-400"
                                                )}>
                                                    {v.complaintCount}
                                                    {v.complaintCount === best && " ⭐"}
                                                </td>
                                            );
                                        })}
                                    </tr>

                                    {/* Recalls */}
                                    <tr>
                                        <td className="p-4 flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4 text-red-500" />
                                            Safety Recalls
                                        </td>
                                        {results.map((v, i) => {
                                            const best = getBestValue(results.map(r => r.recallCount), false);
                                            return (
                                                <td key={i} className={cn(
                                                    "text-center p-4 font-semibold",
                                                    v.recallCount === best && "text-green-600 dark:text-green-400"
                                                )}>
                                                    {v.recallCount}
                                                    {v.recallCount === best && " ⭐"}
                                                </td>
                                            );
                                        })}
                                    </tr>

                                    {/* Combined MPG */}
                                    <tr>
                                        <td className="p-4 flex items-center gap-2">
                                            <Fuel className="w-4 h-4 text-blue-500" />
                                            Combined MPG
                                        </td>
                                        {results.map((v, i) => {
                                            const best = getBestValue(results.map(r => r.combinedMpg));
                                            return (
                                                <td key={i} className={cn(
                                                    "text-center p-4 font-semibold",
                                                    v.combinedMpg === best && "text-green-600 dark:text-green-400"
                                                )}>
                                                    {v.combinedMpg || '--'}
                                                    {v.combinedMpg === best && " ⭐"}
                                                </td>
                                            );
                                        })}
                                    </tr>

                                    {/* Annual Fuel Cost */}
                                    <tr>
                                        <td className="p-4 flex items-center gap-2">
                                            <DollarSign className="w-4 h-4 text-green-500" />
                                            Annual Fuel Cost
                                        </td>
                                        {results.map((v, i) => {
                                            const best = getBestValue(results.map(r => r.annualFuelCost), false);
                                            return (
                                                <td key={i} className={cn(
                                                    "text-center p-4 font-semibold",
                                                    v.annualFuelCost === best && "text-green-600 dark:text-green-400"
                                                )}>
                                                    {v.annualFuelCost ? `$${v.annualFuelCost.toLocaleString()}` : '--'}
                                                    {v.annualFuelCost === best && " ⭐"}
                                                </td>
                                            );
                                        })}
                                    </tr>

                                    {/* 5-Year Cost */}
                                    <tr>
                                        <td className="p-4 flex items-center gap-2">
                                            <DollarSign className="w-4 h-4 text-purple-500" />
                                            5-Year Ownership Cost
                                        </td>
                                        {results.map((v, i) => {
                                            const best = getBestValue(results.map(r => r.fiveYearCost), false);
                                            return (
                                                <td key={i} className={cn(
                                                    "text-center p-4 font-semibold",
                                                    v.fiveYearCost === best && "text-green-600 dark:text-green-400"
                                                )}>
                                                    {v.fiveYearCost ? `$${v.fiveYearCost.toLocaleString()}` : '--'}
                                                    {v.fiveYearCost === best && " ⭐"}
                                                </td>
                                            );
                                        })}
                                    </tr>

                                    {/* Top Problems */}
                                    <tr>
                                        <td className="p-4">Top Reported Issues</td>
                                        {results.map((v, i) => (
                                            <td key={i} className="text-center p-4 text-sm">
                                                {v.topProblems.length > 0
                                                    ? v.topProblems.join(', ')
                                                    : <span className="text-green-600">None reported</span>}
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* View Full Reports */}
                        <div className="grid gap-4 md:grid-cols-3">
                            {results.map((v, i) => (
                                <Link
                                    key={i}
                                    href={`/vehicle/${v.year}/${encodeURIComponent(v.make)}/${encodeURIComponent(v.model)}`}
                                    className="block text-center py-3 px-4 border rounded-lg hover:bg-muted transition-colors"
                                >
                                    View Full {v.make} {v.model} Report →
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
