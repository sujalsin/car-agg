import { NHTSAComplaint, NHTSARecall, categorizeComponent, calculateComplaintSeverity } from '@/services/nhtsa';

export interface ComponentScore {
    category: string;
    score: number;
    complaintCount: number;
    issues: string[];
}

export interface ReliabilityScore {
    overall: number;
    components: ComponentScore[];
    complaintCount: number;
    recallCount: number;
    severityBreakdown: {
        critical: number; // Crashes, fires, deaths
        major: number; // Injuries, significant issues
        minor: number; // Inconveniences
    };
    lemonYearRisk: 'low' | 'moderate' | 'high';
}

// Component weights for overall score calculation
const COMPONENT_WEIGHTS: Record<string, number> = {
    'Engine': 0.20,
    'Transmission': 0.18,
    'Electrical': 0.12,
    'Brakes': 0.15,
    'Safety Systems': 0.15,
    'Steering/Suspension': 0.10,
    'Interior': 0.05,
    'Exterior': 0.02,
    'Visibility': 0.03,
    'Other': 0.00,
};

// Base score for components with no complaints
const BASE_COMPONENT_SCORE = 9.5;

// Calculate reliability score from complaints and recalls
export function calculateReliabilityScore(
    complaints: NHTSAComplaint[],
    recalls: NHTSARecall[],
    estimatedSalesVolume: number = 50000 // Default assumption for normalization
): ReliabilityScore {
    // Group complaints by component category
    const componentComplaints: Record<string, NHTSAComplaint[]> = {};
    for (const complaint of complaints) {
        const category = categorizeComponent(complaint.components);
        if (!componentComplaints[category]) {
            componentComplaints[category] = [];
        }
        componentComplaints[category].push(complaint);
    }

    // Calculate component scores
    const components: ComponentScore[] = [];
    let criticalCount = 0;
    let majorCount = 0;
    let minorCount = 0;

    for (const [category, weight] of Object.entries(COMPONENT_WEIGHTS)) {
        const categoryComplaints = componentComplaints[category] || [];
        const complaintCount = categoryComplaints.length;

        // Calculate deduction based on complaint frequency and severity
        let severitySum = 0;
        const issues: string[] = [];

        for (const complaint of categoryComplaints) {
            const severity = calculateComplaintSeverity(complaint);
            severitySum += severity;

            if (complaint.numberOfDeaths > 0 || complaint.fire === 'Y') {
                criticalCount++;
            } else if (complaint.crash === 'Y' || complaint.numberOfInjuries > 0) {
                majorCount++;
            } else {
                minorCount++;
            }

            // Extract key issues (first 50 chars of summary)
            const issue = complaint.summary.slice(0, 100);
            if (!issues.includes(issue)) {
                issues.push(issue);
            }
        }

        // Normalize by sales volume (complaints per 10,000 vehicles)
        const normalizedRate = (complaintCount / estimatedSalesVolume) * 10000;

        // Calculate component score (10 = perfect, 0 = terrible)
        // Deduct based on complaint rate and severity
        let score = BASE_COMPONENT_SCORE;
        score -= Math.min(normalizedRate * 0.5, 3); // Rate-based deduction
        score -= Math.min((severitySum / 100) * 2, 4); // Severity-based deduction

        // Ensure score stays in 0-10 range
        score = Math.max(0, Math.min(10, score));

        components.push({
            category,
            score: Math.round(score * 10) / 10,
            complaintCount,
            issues: issues.slice(0, 5), // Top 5 issues
        });
    }

    // Apply recall penalties
    let recallPenalty = 0;
    for (const recall of recalls) {
        // Weight recall by affected units
        const unitPenalty = Math.min(recall.possiblyAffected / 100000, 0.5);
        recallPenalty += 0.2 + unitPenalty;
    }

    // Calculate overall score as weighted average
    let overallScore = 0;
    let totalWeight = 0;

    for (const component of components) {
        const weight = COMPONENT_WEIGHTS[component.category] || 0;
        overallScore += component.score * weight;
        totalWeight += weight;
    }

    if (totalWeight > 0) {
        overallScore = overallScore / totalWeight;
    } else {
        overallScore = BASE_COMPONENT_SCORE;
    }

    // Apply recall penalty to overall score
    overallScore = Math.max(0, overallScore - recallPenalty);
    overallScore = Math.round(overallScore * 10) / 10;

    // Determine lemon year risk
    let lemonYearRisk: 'low' | 'moderate' | 'high';
    if (criticalCount > 5 || overallScore < 5) {
        lemonYearRisk = 'high';
    } else if (criticalCount > 2 || majorCount > 10 || overallScore < 7) {
        lemonYearRisk = 'moderate';
    } else {
        lemonYearRisk = 'low';
    }

    return {
        overall: overallScore,
        components,
        complaintCount: complaints.length,
        recallCount: recalls.length,
        severityBreakdown: {
            critical: criticalCount,
            major: majorCount,
            minor: minorCount,
        },
        lemonYearRisk,
    };
}

// Get score color based on value
export function getScoreColor(score: number): string {
    if (score >= 8) return 'text-green-500';
    if (score >= 6) return 'text-yellow-500';
    if (score >= 4) return 'text-orange-500';
    return 'text-red-500';
}

// Get score label
export function getScoreLabel(score: number): string {
    if (score >= 9) return 'Excellent';
    if (score >= 8) return 'Very Good';
    if (score >= 7) return 'Good';
    if (score >= 6) return 'Above Average';
    if (score >= 5) return 'Average';
    if (score >= 4) return 'Below Average';
    if (score >= 3) return 'Poor';
    return 'Very Poor';
}

// Format complaint percentage
export function formatComplaintPercentage(
    complaintCount: number,
    estimatedSales: number
): string {
    const percentage = (complaintCount / estimatedSales) * 100;
    if (percentage < 0.01) return '<0.01%';
    if (percentage < 0.1) return `${percentage.toFixed(2)}%`;
    return `${percentage.toFixed(1)}%`;
}

// Identify "What Breaks" - top issues by category
export function getWhatBreaksData(
    components: ComponentScore[]
): Array<{ category: string; percentage: number; topIssue: string }> {
    const totalComplaints = components.reduce((sum, c) => sum + c.complaintCount, 0);
    if (totalComplaints === 0) return [];

    return components
        .filter((c) => c.complaintCount > 0)
        .sort((a, b) => b.complaintCount - a.complaintCount)
        .slice(0, 6)
        .map((c) => ({
            category: c.category,
            percentage: Math.round((c.complaintCount / totalComplaints) * 100),
            topIssue: c.issues[0] || 'Various issues reported',
        }));
}
