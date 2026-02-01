'use client';

import { cn } from '@/lib/utils';

interface ScoreGaugeProps {
    score: number;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    className?: string;
}

export function ScoreGauge({ score, size = 'md', showLabel = true, className }: ScoreGaugeProps) {
    const getScoreColor = (score: number): string => {
        if (score >= 8) return 'score-excellent';
        if (score >= 6.5) return 'score-good';
        if (score >= 5) return 'score-average';
        if (score >= 3.5) return 'score-poor';
        return 'score-bad';
    };

    const getScoreLabel = (score: number): string => {
        if (score >= 9) return 'Excellent';
        if (score >= 8) return 'Very Good';
        if (score >= 7) return 'Good';
        if (score >= 6) return 'Above Average';
        if (score >= 5) return 'Average';
        if (score >= 4) return 'Below Average';
        if (score >= 3) return 'Poor';
        return 'Very Poor';
    };

    const getScoreBgColor = (score: number): string => {
        if (score >= 8) return 'score-bg-excellent';
        if (score >= 6.5) return 'score-bg-good';
        if (score >= 5) return 'score-bg-average';
        if (score >= 3.5) return 'score-bg-poor';
        return 'score-bg-bad';
    };

    const sizeClasses = {
        sm: 'w-16 h-16 text-xl',
        md: 'w-24 h-24 text-3xl',
        lg: 'w-32 h-32 text-4xl',
    };

    const percentage = (score / 10) * 100;
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className={cn('flex flex-col items-center gap-2', className)}>
            <div className={cn('relative', sizeClasses[size])}>
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-muted"
                    />
                    {/* Progress circle */}
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeLinecap="round"
                        className={getScoreColor(score)}
                        style={{
                            strokeDasharray: circumference,
                            strokeDashoffset,
                            transition: 'stroke-dashoffset 1s ease-out',
                        }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={cn('font-semibold', getScoreColor(score))}>
                        {score.toFixed(1)}
                    </span>
                </div>
            </div>
            {showLabel && (
                <div className="text-center">
                    <span className={cn('text-sm font-medium', getScoreColor(score))}>
                        {getScoreLabel(score)}
                    </span>
                </div>
            )}
        </div>
    );
}

interface ScoreBadgeProps {
    score: number;
    label?: string;
    className?: string;
}

export function ScoreBadge({ score, label, className }: ScoreBadgeProps) {
    const getScoreBgClass = (score: number): string => {
        if (score >= 8) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        if (score >= 6.5) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
        if (score >= 5) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
        if (score >= 3.5) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    };

    return (
        <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium', getScoreBgClass(score), className)}>
            <span>{score.toFixed(1)}</span>
            {label && <span className="text-xs opacity-75">/ 10</span>}
        </div>
    );
}
