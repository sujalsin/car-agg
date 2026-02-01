'use client';

import { cn } from '@/lib/utils';
import { AlertTriangle, AlertCircle, CheckCircle, Info, ExternalLink } from 'lucide-react';

interface Recall {
    campaignNumber: string;
    date: string;
    component: string;
    summary: string;
    consequence: string;
    remedy: string;
}

interface SafetyTimelineProps {
    recalls: Recall[];
    className?: string;
}

export function SafetyTimeline({ recalls, className }: SafetyTimelineProps) {
    if (recalls.length === 0) {
        return (
            <div className={cn('flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800', className)}>
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <p className="text-green-700 dark:text-green-300 text-sm">
                    No recalls have been issued for this vehicle.
                </p>
            </div>
        );
    }

    // Sort recalls by date (newest first)
    const sortedRecalls = [...recalls].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const getSeverityIcon = (consequence: string) => {
        const lowerConsequence = consequence.toLowerCase();
        if (lowerConsequence.includes('crash') || lowerConsequence.includes('injury') || lowerConsequence.includes('fire')) {
            return <AlertTriangle className="w-4 h-4 text-red-500" />;
        }
        if (lowerConsequence.includes('accident') || lowerConsequence.includes('damage')) {
            return <AlertCircle className="w-4 h-4 text-orange-500" />;
        }
        return <Info className="w-4 h-4 text-blue-500" />;
    };

    // Robust date formatting that handles various date formats
    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'Date unavailable';

        // Try parsing as-is
        let date = new Date(dateStr);

        // If invalid, try parsing DD/MM/YYYY format
        if (isNaN(date.getTime())) {
            const parts = dateStr.split('/');
            if (parts.length === 3) {
                // Try DD/MM/YYYY
                date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                // If still invalid, try MM/DD/YYYY
                if (isNaN(date.getTime())) {
                    date = new Date(`${parts[2]}-${parts[0]}-${parts[1]}`);
                }
            }
        }

        if (isNaN(date.getTime())) {
            // Extract year if possible
            const yearMatch = dateStr.match(/\d{4}/);
            return yearMatch ? yearMatch[0] : dateStr;
        }

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    // Generate NHTSA recall lookup URL
    const getNHTSARecallUrl = (campaignNumber: string) => {
        return `https://www.nhtsa.gov/recalls?nhtsaId=${encodeURIComponent(campaignNumber)}`;
    };

    return (
        <div className={cn('space-y-4', className)}>
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">
                    {recalls.length} Recall{recalls.length !== 1 ? 's' : ''} Found
                </h3>
                <a
                    href="https://www.nhtsa.gov/recalls"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"
                >
                    Source: NHTSA.gov
                    <ExternalLink className="w-3 h-3" />
                </a>
            </div>

            <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-border" />

                <div className="space-y-4">
                    {sortedRecalls.map((recall, index) => (
                        <div key={recall.campaignNumber} className="relative pl-6 animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
                            {/* Timeline dot */}
                            <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-background border-2 border-border flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                            </div>

                            <div className="bg-card border rounded-lg p-4 space-y-3 card-hover">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        {getSeverityIcon(recall.consequence)}
                                        <span className="font-medium text-sm">{recall.component}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                        {formatDate(recall.date)}
                                    </span>
                                </div>

                                <p className="text-sm text-foreground leading-relaxed">
                                    {recall.summary}
                                </p>

                                {recall.consequence && (
                                    <div className="pt-2 border-t border-border/50">
                                        <p className="text-xs text-muted-foreground">
                                            <span className="font-medium text-foreground">Risk: </span>
                                            {recall.consequence}
                                        </p>
                                    </div>
                                )}

                                {recall.remedy && (
                                    <div className="bg-muted/50 rounded-md p-2">
                                        <p className="text-xs text-muted-foreground">
                                            <span className="font-medium text-foreground">Fix: </span>
                                            {recall.remedy}
                                        </p>
                                    </div>
                                )}

                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Campaign: {recall.campaignNumber}</span>
                                    <a
                                        href={getNHTSARecallUrl(recall.campaignNumber)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:text-blue-600 flex items-center gap-1"
                                    >
                                        View on NHTSA
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
