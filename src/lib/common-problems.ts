import { NHTSAComplaint } from '@/services/nhtsa';

export interface CommonProblem {
    component: string;
    count: number;
    percentage: number;
    hasCrashes: boolean;
    hasFires: boolean;
    hasInjuries: boolean;
    sampleIssues: string[];
}

export interface ProsConsSummary {
    pros: string[];
    cons: string[];
    verdict: 'recommended' | 'caution' | 'avoid';
}

// Aggregate common problems from complaints
export function aggregateCommonProblems(complaints: NHTSAComplaint[]): CommonProblem[] {
    if (complaints.length === 0) return [];

    // Group by component
    const componentMap = new Map<string, {
        count: number;
        crashes: boolean;
        fires: boolean;
        injuries: boolean;
        summaries: string[];
    }>();

    for (const complaint of complaints) {
        const components = complaint.components.split(',').map(c => c.trim());

        for (const component of components) {
            const normalized = normalizeComponent(component);
            const existing = componentMap.get(normalized) || {
                count: 0,
                crashes: false,
                fires: false,
                injuries: false,
                summaries: [],
            };

            existing.count++;
            existing.crashes = existing.crashes || complaint.crash === 'Y';
            existing.fires = existing.fires || complaint.fire === 'Y';
            existing.injuries = existing.injuries || complaint.numberOfInjuries > 0;

            if (existing.summaries.length < 3 && complaint.summary) {
                existing.summaries.push(complaint.summary.slice(0, 150));
            }

            componentMap.set(normalized, existing);
        }
    }

    // Convert to array and sort by count
    const problems: CommonProblem[] = [];
    const total = complaints.length;

    for (const [component, data] of componentMap.entries()) {
        problems.push({
            component,
            count: data.count,
            percentage: Math.round((data.count / total) * 100),
            hasCrashes: data.crashes,
            hasFires: data.fires,
            hasInjuries: data.injuries,
            sampleIssues: data.summaries,
        });
    }

    return problems.sort((a, b) => b.count - a.count).slice(0, 8); // Top 8
}

// Normalize component names
function normalizeComponent(component: string): string {
    const normalized = component.toUpperCase().trim();

    // Map similar components together
    const mappings: Record<string, string> = {
        'POWER TRAIN:AUTOMATIC TRANSMISSION': 'Transmission',
        'POWERTRAIN:AUTOMATIC TRANSMISSION': 'Transmission',
        'POWER TRAIN': 'Powertrain',
        'ENGINE AND ENGINE COOLING': 'Engine',
        'ENGINE': 'Engine',
        'ELECTRICAL SYSTEM': 'Electrical',
        'ELECTRONIC STABILITY CONTROL': 'Stability Control',
        'SERVICE BRAKES': 'Brakes',
        'SERVICE BRAKES, HYDRAULIC': 'Brakes',
        'AIR BAGS': 'Airbags',
        'SEATS': 'Seats',
        'SEAT BELTS': 'Seat Belts',
        'STEERING': 'Steering',
        'SUSPENSION': 'Suspension',
        'FUEL SYSTEM': 'Fuel System',
        'FUEL SYSTEM, GASOLINE': 'Fuel System',
        'VISIBILITY': 'Visibility',
        'VISIBILITY:WINDSHIELD': 'Windshield',
        'STRUCTURE': 'Structure',
        'EXTERIOR LIGHTING': 'Exterior Lights',
        'INTERIOR LIGHTING': 'Interior Lights',
        'WHEELS': 'Wheels',
        'TIRES': 'Tires',
        'VEHICLE SPEED CONTROL': 'Cruise Control',
        'FORWARD COLLISION AVOIDANCE': 'Collision Avoidance',
        'LANE DEPARTURE': 'Lane Departure',
        'BACK OVER PREVENTION': 'Backup Camera',
    };

    for (const [key, value] of Object.entries(mappings)) {
        if (normalized.includes(key)) {
            return value;
        }
    }

    // Title case the original
    return component.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

// Generate pros and cons from vehicle data
export function generateProsAndCons(
    reliabilityScore: number,
    complaintCount: number,
    recallCount: number,
    combinedMpg: number | null,
    problems: CommonProblem[]
): ProsConsSummary {
    const pros: string[] = [];
    const cons: string[] = [];

    // Reliability-based
    if (reliabilityScore >= 9) {
        pros.push('Excellent reliability record with minimal reported issues');
    } else if (reliabilityScore >= 8) {
        pros.push('Good reliability with few significant problems');
    } else if (reliabilityScore >= 7) {
        pros.push('Above-average reliability for its class');
    }

    if (reliabilityScore < 6) {
        cons.push('Below-average reliability - consider extended warranty');
    }

    // Complaint-based
    if (complaintCount === 0) {
        pros.push('No complaints reported to NHTSA');
    } else if (complaintCount <= 5) {
        pros.push('Very few owner complaints reported');
    } else if (complaintCount > 50) {
        cons.push(`High number of complaints (${complaintCount}) reported to NHTSA`);
    }

    // Recall-based  
    if (recallCount === 0) {
        pros.push('No safety recalls issued');
    } else if (recallCount > 3) {
        cons.push(`Multiple safety recalls (${recallCount}) - verify repairs completed`);
    }

    // Fuel economy
    if (combinedMpg) {
        if (combinedMpg >= 35) {
            pros.push(`Excellent fuel economy (${combinedMpg} MPG combined)`);
        } else if (combinedMpg >= 28) {
            pros.push(`Good fuel economy (${combinedMpg} MPG combined)`);
        } else if (combinedMpg < 18) {
            cons.push(`Poor fuel economy (${combinedMpg} MPG combined)`);
        }
    }

    // Problem-specific cons
    const severeProblems = problems.filter(p => p.hasCrashes || p.hasFires || p.hasInjuries);
    if (severeProblems.length > 0) {
        cons.push(`Safety concerns reported with: ${severeProblems.map(p => p.component).join(', ')}`);
    }

    // Top problem areas
    const topProblems = problems.slice(0, 3).filter(p => p.percentage >= 15);
    if (topProblems.length > 0) {
        cons.push(`Common issues: ${topProblems.map(p => p.component).join(', ')}`);
    }

    // Determine verdict
    let verdict: 'recommended' | 'caution' | 'avoid';
    if (reliabilityScore >= 7.5 && severeProblems.length === 0) {
        verdict = 'recommended';
    } else if (reliabilityScore < 5 || severeProblems.length >= 2) {
        verdict = 'avoid';
    } else {
        verdict = 'caution';
    }

    return { pros, cons, verdict };
}
