'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Car,
    AlertTriangle,
    Fuel,
    DollarSign,
    Play,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScoreGauge, ScoreBadge } from '@/components/ScoreGauge';
import { SafetyTimeline } from '@/components/SafetyTimeline';
import { WhatBreaks } from '@/components/WhatBreaks';
import { CostCalculator } from '@/components/CostCalculator';
import { YouTubeReviews } from '@/components/YouTubeReviews';

interface VehicleData {
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
        annualFuelCost: number | null;
        realWorldMpg: number | null;
        realWorldSampleSize: number | null;
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
    commonProblems: Array<{
        component: string;
        count: number;
        percentage: number;
        hasCrashes: boolean;
        hasFires: boolean;
        hasInjuries: boolean;
        sampleIssues: string[];
    }>;
    prosAndCons: {
        pros: string[];
        cons: string[];
        verdict: 'recommended' | 'caution' | 'avoid';
    };
}

export default function VehiclePage() {
    const params = useParams();
    const router = useRouter();
    const [data, setData] = useState<VehicleData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [expandedComplaints, setExpandedComplaints] = useState(false);

    const year = params.year as string;
    const make = decodeURIComponent(params.make as string);
    const model = decodeURIComponent(params.model as string);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `/api/vehicles?year=${year}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch vehicle data');
                }

                const vehicleData = await response.json();
                setData(vehicleData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [year, make, model]);

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'specs', label: 'Specs & Trims' },
        { id: 'safety', label: 'Safety' },
        { id: 'fuel', label: 'Fuel Economy' },
        { id: 'cost', label: 'Ownership Cost' },
        { id: 'reviews', label: 'Reviews' },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-muted border-t-foreground rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading vehicle data...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center max-w-md p-8">
                    <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
                    <h1 className="text-xl font-semibold mb-2">Unable to Load Vehicle Data</h1>
                    <p className="text-muted-foreground mb-6">{error || 'Vehicle not found'}</p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Search
                    </Link>
                </div>
            </div>
        );
    }

    const getWhatBreaksData = () => {
        const totalComplaints = data.reliabilityScore.components.reduce((sum, c) => sum + c.complaintCount, 0);
        if (totalComplaints === 0) return [];

        return data.reliabilityScore.components
            .filter((c) => c.complaintCount > 0)
            .sort((a, b) => b.complaintCount - a.complaintCount)
            .slice(0, 6)
            .map((c) => ({
                category: c.category,
                percentage: Math.round((c.complaintCount / totalComplaints) * 100),
                topIssue: c.issues[0] || 'Various issues reported',
            }));
    };

    const getLemonRiskColor = (risk: string) => {
        switch (risk) {
            case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'moderate': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            <span className="text-sm hidden sm:inline">Back</span>
                        </Link>
                        <div className="h-4 w-px bg-border" />
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
                                <Car className="w-5 h-5 text-background" />
                            </div>
                            <span className="font-semibold">CARAG</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="border-b border-border">
                <div className="max-w-6xl mx-auto px-6 py-8">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">
                                {data.year} {data.make} {data.model}
                            </h1>
                            <div className="flex flex-wrap items-center gap-3">
                                <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', getLemonRiskColor(data.reliabilityScore.lemonYearRisk))}>
                                    {data.reliabilityScore.lemonYearRisk === 'low' && '✓ Safe Buy'}
                                    {data.reliabilityScore.lemonYearRisk === 'moderate' && '⚠ Moderate Risk'}
                                    {data.reliabilityScore.lemonYearRisk === 'high' && '⚠ Lemon Risk'}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    {data.reliabilityScore.complaintCount} complaints • {data.reliabilityScore.recallCount} recalls
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <ScoreGauge score={data.reliabilityScore.overall} size="lg" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Tabs */}
            <nav className="border-b border-border sticky top-[65px] z-40 bg-background">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex gap-1 overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    'px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                                    activeTab === tab.id
                                        ? 'border-foreground text-foreground'
                                        : 'border-transparent text-muted-foreground hover:text-foreground'
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Content */}
            <main className="max-w-6xl mx-auto px-6 py-8">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
                        {/* Left Column - Scores & What Breaks */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-card border rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold">{data.reliabilityScore.overall.toFixed(1)}</p>
                                    <p className="text-xs text-muted-foreground">Reliability Score</p>
                                </div>
                                <div className="bg-card border rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold">{data.reliabilityScore.complaintCount}</p>
                                    <p className="text-xs text-muted-foreground">Complaints</p>
                                </div>
                                <div className="bg-card border rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold">{data.reliabilityScore.recallCount}</p>
                                    <p className="text-xs text-muted-foreground">Recalls</p>
                                </div>
                                <div className="bg-card border rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold">{data.variants[0]?.combinedMpg || '--'}</p>
                                    <p className="text-xs text-muted-foreground">Combined MPG</p>
                                </div>
                            </div>

                            {/* What Breaks */}
                            <div className="bg-card border rounded-xl p-6">
                                <h2 className="text-lg font-semibold mb-4">What Breaks</h2>
                                <WhatBreaks
                                    data={getWhatBreaksData()}
                                    totalComplaints={data.reliabilityScore.complaintCount}
                                />
                            </div>

                            {/* Component Scores */}
                            <div className="bg-card border rounded-xl p-6">
                                <h2 className="text-lg font-semibold mb-4">Component Reliability</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {data.reliabilityScore.components
                                        .filter(c => c.category !== 'Other')
                                        .map((component) => (
                                            <div key={component.category} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                                <span className="text-sm font-medium">{component.category}</span>
                                                <ScoreBadge score={component.score} />
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Quick Info */}
                        <div className="space-y-6">
                            {/* Pros & Cons Summary */}
                            {data.prosAndCons && (
                                <div className="bg-card border rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold">At a Glance</h3>
                                        <span className={cn(
                                            'px-3 py-1 rounded-full text-xs font-bold',
                                            data.prosAndCons.verdict === 'recommended' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                                            data.prosAndCons.verdict === 'caution' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                                            data.prosAndCons.verdict === 'avoid' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        )}>
                                            {data.prosAndCons.verdict === 'recommended' && 'Recommended'}
                                            {data.prosAndCons.verdict === 'caution' && 'Proceed with Caution'}
                                            {data.prosAndCons.verdict === 'avoid' && 'Not Recommended'}
                                        </span>
                                    </div>
                                    <div className="space-y-3">
                                        {data.prosAndCons.pros.slice(0, 3).map((pro, i) => (
                                            <div key={i} className="flex items-start gap-2 text-sm">
                                                <span className="text-green-500 mt-0.5">✓</span>
                                                <span>{pro}</span>
                                            </div>
                                        ))}
                                        {data.prosAndCons.cons.slice(0, 3).map((con, i) => (
                                            <div key={i} className="flex items-start gap-2 text-sm">
                                                <span className="text-red-500 mt-0.5">✗</span>
                                                <span>{con}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Severity Breakdown */}
                            <div className="bg-card border rounded-xl p-6">
                                <h3 className="font-semibold mb-4">Issue Severity</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-red-500" />
                                            Critical (crashes, fires)
                                        </span>
                                        <span className="font-semibold">{data.reliabilityScore.severityBreakdown.critical}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-orange-500" />
                                            Major (injuries)
                                        </span>
                                        <span className="font-semibold">{data.reliabilityScore.severityBreakdown.major}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                                            Minor (inconveniences)
                                        </span>
                                        <span className="font-semibold">{data.reliabilityScore.severityBreakdown.minor}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Variants */}
                            {data.variants.length > 0 && (
                                <div className="bg-card border rounded-xl p-6">
                                    <h3 className="font-semibold mb-4">Available Trims</h3>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {data.variants.slice(0, 5).map((variant) => (
                                            <div key={variant.id} className="p-3 bg-muted/50 rounded-lg">
                                                <p className="text-sm font-medium line-clamp-1">{variant.trim}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {variant.combinedMpg} MPG • {variant.drivetrain}
                                                </p>
                                            </div>
                                        ))}
                                        {data.variants.length > 5 && (
                                            <p className="text-xs text-muted-foreground text-center">
                                                +{data.variants.length - 5} more trims
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Specs & Trims Tab */}
                {activeTab === 'specs' && (
                    <div className="max-w-5xl animate-fadeIn">
                        <h2 className="text-xl font-semibold mb-2">Full Specifications</h2>
                        <p className="text-muted-foreground mb-6">Complete technical details for {year} {make} {model}</p>

                        {/* Key Specs Overview */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className="bg-card border rounded-xl p-4 text-center">
                                <p className="text-3xl font-bold text-blue-500">
                                    {data.variants[0]?.engine?.match(/(\d+\.?\d*)\s?L/)?.[1] || data.variants[0]?.engine?.match(/(\d+)\s?cyl/)?.[1] || '--'}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {data.variants[0]?.engine?.includes('L') ? 'Liters' : 'Cylinders'}
                                </p>
                            </div>
                            <div className="bg-card border rounded-xl p-4 text-center">
                                <p className="text-3xl font-bold text-green-500">
                                    {data.variants.length > 0 ? Math.max(...data.variants.map(v => v.combinedMpg || 0)) : '--'}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">Best MPG</p>
                            </div>
                            <div className="bg-card border rounded-xl p-4 text-center">
                                <p className="text-3xl font-bold text-purple-500">
                                    {[...new Set(data.variants.map(v => v.drivetrain))].length || 1}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">Drive Options</p>
                            </div>
                            <div className="bg-card border rounded-xl p-4 text-center">
                                <p className="text-3xl font-bold text-orange-500">{data.variants.length || 0}</p>
                                <p className="text-xs text-muted-foreground mt-1">Configurations</p>
                            </div>
                        </div>

                        {data.variants.length > 0 ? (
                            <div className="space-y-6">
                                {/* Engine & Performance */}
                                <div className="bg-card border rounded-xl overflow-hidden">
                                    <div className="bg-muted/50 px-5 py-3 border-b">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                            Engine & Performance
                                        </h3>
                                    </div>
                                    <div className="p-5">
                                        <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
                                            <div className="flex justify-between py-2 border-b border-dashed">
                                                <span className="text-muted-foreground">Engine Options</span>
                                                <span className="font-medium text-right max-w-[60%]">
                                                    {[...new Set(data.variants.map(v => v.engine))].filter(Boolean).join(' / ') || '--'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-dashed">
                                                <span className="text-muted-foreground">Fuel Type</span>
                                                <span className="font-medium text-right">
                                                    {[...new Set(data.variants.map(v => v.fuelType))].filter(Boolean).join(', ') || '--'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-dashed">
                                                <span className="text-muted-foreground">Transmission</span>
                                                <span className="font-medium text-right max-w-[60%] truncate">
                                                    {[...new Set(data.variants.map(v => v.trim?.split(',')[0]))].filter(Boolean).slice(0, 3).join(' / ') || '--'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-dashed">
                                                <span className="text-muted-foreground">Drivetrain</span>
                                                <span className="font-medium text-right">
                                                    {[...new Set(data.variants.map(v => v.drivetrain))].filter(Boolean).join(' / ') || '--'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Fuel Economy Summary */}
                                <div className="bg-card border rounded-xl overflow-hidden">
                                    <div className="bg-muted/50 px-5 py-3 border-b">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                            Fuel Economy (EPA Estimated)
                                        </h3>
                                    </div>
                                    <div className="p-5">
                                        <div className="grid md:grid-cols-3 gap-4">
                                            <div className="text-center p-4 bg-muted/30 rounded-lg">
                                                <p className="text-2xl font-bold">
                                                    {Math.min(...data.variants.map(v => v.cityMpg || 999).filter(n => n < 999))} - {Math.max(...data.variants.map(v => v.cityMpg || 0))}
                                                </p>
                                                <p className="text-sm text-muted-foreground">City MPG</p>
                                            </div>
                                            <div className="text-center p-4 bg-muted/30 rounded-lg">
                                                <p className="text-2xl font-bold">
                                                    {Math.min(...data.variants.map(v => v.highwayMpg || 999).filter(n => n < 999))} - {Math.max(...data.variants.map(v => v.highwayMpg || 0))}
                                                </p>
                                                <p className="text-sm text-muted-foreground">Highway MPG</p>
                                            </div>
                                            <div className="text-center p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                                <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                                                    {Math.min(...data.variants.map(v => v.combinedMpg || 999).filter(n => n < 999))} - {Math.max(...data.variants.map(v => v.combinedMpg || 0))}
                                                </p>
                                                <p className="text-sm text-green-600 dark:text-green-500">Combined MPG</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* All Configurations Table */}
                                <div className="bg-card border rounded-xl overflow-hidden">
                                    <div className="bg-muted/50 px-5 py-3 border-b">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                            All Configurations ({data.variants.length})
                                        </h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-muted/50 border-b">
                                                <tr>
                                                    <th className="text-left p-4 font-semibold text-sm">Configuration</th>
                                                    <th className="text-center p-4 font-semibold text-sm">Drivetrain</th>
                                                    <th className="text-center p-4 font-semibold text-sm">City MPG</th>
                                                    <th className="text-center p-4 font-semibold text-sm">Hwy MPG</th>
                                                    <th className="text-center p-4 font-semibold text-sm">Combined</th>
                                                    <th className="text-center p-4 font-semibold text-sm">Fuel Cost/yr</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {data.variants.map((variant) => (
                                                    <tr key={variant.id} className="hover:bg-muted/30 transition-colors">
                                                        <td className="p-4">
                                                            <p className="font-medium text-sm">{variant.trim || 'Base'}</p>
                                                            <p className="text-xs text-muted-foreground">{variant.engine || 'Standard'}</p>
                                                        </td>
                                                        <td className="text-center p-4 text-sm">{variant.drivetrain || '--'}</td>
                                                        <td className="text-center p-4 text-sm font-medium">{variant.cityMpg || '--'}</td>
                                                        <td className="text-center p-4 text-sm font-medium">{variant.highwayMpg || '--'}</td>
                                                        <td className="text-center p-4">
                                                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-muted font-bold text-sm">
                                                                {variant.combinedMpg || '--'}
                                                            </span>
                                                        </td>
                                                        <td className="text-center p-4 text-sm">
                                                            {variant.annualFuelCost ? `$${variant.annualFuelCost.toLocaleString()}` : '--'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Quick Specs Summary */}
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="bg-card border rounded-xl p-5">
                                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                            Engine Options
                                        </h3>
                                        <div className="space-y-2">
                                            {[...new Set(data.variants.map(v => v.engine))].filter(Boolean).slice(0, 5).map((engine, i) => (
                                                <p key={i} className="text-sm text-muted-foreground">{engine}</p>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-card border rounded-xl p-5">
                                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                            Drivetrain Options
                                        </h3>
                                        <div className="space-y-2">
                                            {[...new Set(data.variants.map(v => v.drivetrain))].filter(Boolean).map((drive, i) => (
                                                <p key={i} className="text-sm text-muted-foreground">{drive}</p>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-card border rounded-xl p-5">
                                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                            Fuel Types
                                        </h3>
                                        <div className="space-y-2">
                                            {[...new Set(data.variants.map(v => v.fuelType))].filter(Boolean).map((fuel, i) => (
                                                <p key={i} className="text-sm text-muted-foreground">{fuel}</p>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <p className="text-xs text-muted-foreground text-center">
                                    Data from EPA FuelEconomy.gov. Actual fuel economy will vary based on driving conditions.
                                </p>
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-muted/30 rounded-xl">
                                <p className="text-muted-foreground">No variant data available for this vehicle.</p>
                                <p className="text-sm text-muted-foreground mt-2">Try searching for a different model year.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Safety Tab */}
                {activeTab === 'safety' && (
                    <div className="max-w-3xl animate-fadeIn">
                        <h2 className="text-xl font-semibold mb-6">Recall History</h2>
                        <SafetyTimeline recalls={data.recalls} />

                        {data.complaints.length > 0 && (
                            <div className="mt-8">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-xl font-semibold">Recent Complaints</h2>
                                        <a
                                            href={`https://www.nhtsa.gov/vehicle/${data.year}/${encodeURIComponent(data.make)}/${encodeURIComponent(data.model)}/complaints`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"
                                        >
                                            Source: NHTSA.gov
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                    <button
                                        onClick={() => setExpandedComplaints(!expandedComplaints)}
                                        className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                                    >
                                        {expandedComplaints ? 'Show less' : 'Show all'}
                                        {expandedComplaints ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {(expandedComplaints ? data.complaints : data.complaints.slice(0, 5)).map((complaint) => (
                                        <div key={complaint.id} className="bg-card border rounded-lg p-4">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="px-2 py-0.5 bg-muted rounded text-xs font-medium">
                                                        {complaint.component}
                                                    </span>
                                                    {complaint.crash && (
                                                        <span className="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded text-xs">
                                                            Crash
                                                        </span>
                                                    )}
                                                    {complaint.fire && (
                                                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded text-xs">
                                                            Fire
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {(() => {
                                                        const date = new Date(complaint.date);
                                                        return isNaN(date.getTime()) ? complaint.date : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                                    })()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-3">
                                                {complaint.summary}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Fuel Economy Tab */}
                {activeTab === 'fuel' && (
                    <div className="max-w-3xl animate-fadeIn">
                        <h2 className="text-xl font-semibold mb-6">Fuel Economy</h2>

                        {data.variants.length > 0 ? (
                            <div className="space-y-4">
                                {data.variants.map((variant) => (
                                    <div key={variant.id} className="bg-card border rounded-xl p-6">
                                        <h3 className="font-semibold mb-4">{variant.trim}</h3>
                                        <div className="grid grid-cols-3 gap-4 mb-4">
                                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                                                <p className="text-2xl font-bold">{variant.cityMpg}</p>
                                                <p className="text-xs text-muted-foreground">City MPG</p>
                                            </div>
                                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                                                <p className="text-2xl font-bold">{variant.highwayMpg}</p>
                                                <p className="text-xs text-muted-foreground">Highway MPG</p>
                                            </div>
                                            <div className="text-center p-4 bg-primary/10 rounded-lg">
                                                <p className="text-2xl font-bold">{variant.combinedMpg}</p>
                                                <p className="text-xs text-muted-foreground">Combined MPG</p>
                                            </div>
                                        </div>

                                        {variant.realWorldMpg && typeof variant.realWorldMpg === 'number' && (
                                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-green-700 dark:text-green-400">
                                                            Real-World Average
                                                        </p>
                                                        <p className="text-xs text-green-600 dark:text-green-500">
                                                            Based on {variant.realWorldSampleSize || 0} owner reports
                                                        </p>
                                                    </div>
                                                    <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                                                        {Number(variant.realWorldMpg).toFixed(1)} MPG
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                            <span>{variant.engine}</span>
                                            <span>•</span>
                                            <span>{variant.transmission}</span>
                                            <span>•</span>
                                            <span>{variant.drivetrain}</span>
                                            <span>•</span>
                                            <span>{variant.fuelType}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-muted/30 rounded-xl">
                                <Fuel className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">No fuel economy data available</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Ownership Cost Tab */}
                {activeTab === 'cost' && (
                    <div className="max-w-xl mx-auto animate-fadeIn">
                        <h2 className="text-xl font-semibold mb-6">Total Cost of Ownership</h2>
                        <div className="bg-card border rounded-xl p-6">
                            <CostCalculator
                                costs={data.ownershipCost}
                                vehicleName={`${data.year} ${data.make} ${data.model}`}
                            />
                        </div>
                    </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                    <div className="max-w-3xl animate-fadeIn">
                        <h2 className="text-xl font-semibold mb-6">Expert Video Reviews</h2>
                        <YouTubeReviews videos={data.youtubeVideos} />
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-border py-6 px-6 mt-12 bg-muted/30">
                <div className="max-w-6xl mx-auto space-y-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-4 text-xs">
                            <span className="text-muted-foreground">Data Sources:</span>
                            <a href="https://www.nhtsa.gov" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 flex items-center gap-1">
                                NHTSA.gov <ExternalLink className="w-3 h-3" />
                            </a>
                            <a href="https://fueleconomy.gov" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 flex items-center gap-1">
                                FuelEconomy.gov <ExternalLink className="w-3 h-3" />
                            </a>
                            <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 flex items-center gap-1">
                                YouTube <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                        <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
                            Search another vehicle →
                        </Link>
                    </div>
                    <div className="pt-4 border-t border-border/50 text-xs text-muted-foreground text-center">
                        <p>
                            All complaint and recall data is sourced from the National Highway Traffic Safety Administration (NHTSA),
                            a U.S. government agency. This data is public domain under 17 U.S.C. § 105. CARAG is not affiliated with
                            NHTSA, the EPA, or any vehicle manufacturer. Reliability scores are calculated algorithmically from
                            publicly available data and should be used as one factor among many when researching a vehicle purchase.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
