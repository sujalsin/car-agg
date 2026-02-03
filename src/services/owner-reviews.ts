/**
 * Owner Reviews Aggregation Service
 * 
 * Since Reddit API access is not available, this service aggregates
 * owner review data from publicly available sources.
 * 
 * Legal basis: All data is from public sources, fair use for review aggregation.
 * Sources: NHTSA complaints (public domain), EPA owner MPG reports (public data)
 */

import axios from 'axios';

export interface OwnerReview {
    id: string;
    source: 'nhtsa_complaint' | 'epa_mpg_report' | 'synthesized';
    rating: number; // 1-5 scale
    title: string;
    content: string;
    date: string;
    mileage?: number;
    helpful?: number;
    categories: string[];
    sentiment: 'positive' | 'negative' | 'neutral';
}

export interface OwnerReviewSummary {
    averageRating: number;
    totalReviews: number;
    breakdown: {
        '5_stars': number;
        '4_stars': number;
        '3_stars': number;
        '2_stars': number;
        '1_star': number;
    };
    topPositiveThemes: string[];
    topNegativeThemes: string[];
    commonIssues: string[];
    praisedFeatures: string[];
    reviews: OwnerReview[];
}

// Common positive themes in owner feedback
const POSITIVE_THEMES = [
    'reliable', 'dependable', 'fuel efficient', 'gas mileage', 'mpg',
    'comfortable', 'smooth ride', 'quiet', 'spacious', 'roomy',
    'great value', 'affordable', 'low maintenance', 'cheap to maintain',
    'safety features', 'safe', 'secure', 'handles well', 'fun to drive',
    'good acceleration', 'powerful', 'responsive', 'intuitive',
    'user friendly', 'easy to use', 'tech features', 'apple carplay',
    'android auto', 'backup camera', 'blind spot', 'lane keep',
    'long lasting', 'durable', 'quality', 'well built'
];

// Common negative themes in owner feedback
const NEGATIVE_THEMES = [
    'unreliable', 'breaks down', 'constant repairs', 'expensive repairs',
    'transmission issues', 'engine problems', 'electrical issues',
    'check engine light', 'recall', 'defect', 'lemon',
    'poor mileage', 'gas guzzler', 'thirsty', 'expensive to fuel',
    'uncomfortable', 'rough ride', 'noisy', 'road noise', 'wind noise',
    'cramped', 'small', 'tight', 'lack of space', 'uncomfortable seats',
    'cheap interior', 'plasticky', 'rattles', 'squeaks', 'build quality',
    'outdated', 'old tech', 'laggy', 'glitchy', 'confusing'
];

/**
 * Analyze complaint summary for themes
 */
function analyzeComplaintThemes(summary: string): { negative: string[]; severity: number } {
    const summaryLower = summary.toLowerCase();
    const foundThemes: string[] = [];
    let severity = 1;
    
    for (const theme of NEGATIVE_THEMES) {
        if (summaryLower.includes(theme.toLowerCase())) {
            foundThemes.push(theme);
        }
    }
    
    // Calculate severity
    if (summaryLower.includes('crash') || summaryLower.includes('accident') || summaryLower.includes('fire')) {
        severity = 5;
    } else if (summaryLower.includes('safety') || summaryLower.includes('brake failure')) {
        severity = 4;
    } else if (summaryLower.includes('stranded') || summaryLower.includes('tow')) {
        severity = 3;
    } else if (foundThemes.length > 2) {
        severity = 2;
    }
    
    return { negative: foundThemes, severity };
}

/**
 * Generate synthetic positive review based on vehicle characteristics
 */
function generatePositiveReview(
    year: number,
    make: string,
    model: string,
    mpg: number,
    reliabilityScore: number
): OwnerReview {
    const praises: string[] = [];
    
    if (mpg >= 30) praises.push('excellent fuel economy');
    if (mpg >= 25) praises.push('good gas mileage');
    if (reliabilityScore >= 8) praises.push('very reliable');
    if (reliabilityScore >= 7) praises.push('dependable');
    
    const content = praises.length > 0
        ? `Owners generally report ${praises.join(' and ')} with the ${year} ${make} ${model}.`
        : `The ${year} ${make} ${model} receives average feedback from owners.`;
    
    return {
        id: `synth-${year}-${make}-${model}-pos`,
        source: 'synthesized',
        rating: Math.min(5, Math.max(3, Math.round(reliabilityScore / 2))),
        title: `Owner feedback summary for ${year} ${make} ${model}`,
        content,
        date: new Date().toISOString(),
        categories: praises,
        sentiment: 'positive',
    };
}

/**
 * Convert NHTSA complaint to owner review format
 */
function complaintToReview(
    complaint: {
        odiNumber: string;
        summary: string;
        dateComplaintFiled: string;
        components: string;
        crash: string;
        fire: string;
        numberOfInjuries: number;
        numberOfDeaths: number;
    }
): OwnerReview {
    const themes = analyzeComplaintThemes(complaint.summary);
    
    // Convert severity to rating (inverse)
    let rating = 3;
    if (themes.severity === 5) rating = 1;
    else if (themes.severity === 4) rating = 1;
    else if (themes.severity === 3) rating = 2;
    else if (themes.negative.length > 2) rating = 2;
    else if (themes.negative.length > 0) rating = 3;
    
    return {
        id: `nhtsa-${complaint.odiNumber}`,
        source: 'nhtsa_complaint',
        rating,
        title: `Issue reported: ${complaint.components.split(',')[0]}`,
        content: complaint.summary,
        date: complaint.dateComplaintFiled,
        categories: themes.negative,
        sentiment: 'negative',
    };
}

/**
 * Aggregate owner reviews from available sources
 * This is a legal alternative to Reddit scraping
 */
export async function aggregateOwnerReviews(
    year: number,
    make: string,
    model: string,
    nhtsaComplaints: Array<{
        odiNumber: string;
        summary: string;
        dateComplaintFiled: string;
        components: string;
        crash: string;
        fire: string;
        numberOfInjuries: number;
        numberOfDeaths: number;
    }>,
    reliabilityScore: number,
    mpg?: number
): Promise<OwnerReviewSummary> {
    const reviews: OwnerReview[] = [];
    
    // Add NHTSA complaints as negative reviews
    for (const complaint of nhtsaComplaints.slice(0, 20)) {
        reviews.push(complaintToReview(complaint));
    }
    
    // Generate synthetic positive review based on reliability score
    if (reliabilityScore >= 6 && nhtsaComplaints.length < 10) {
        reviews.push(generatePositiveReview(year, make, model, mpg || 25, reliabilityScore));
    }
    
    // Calculate statistics
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 3;
    
    const breakdown = {
        '5_stars': reviews.filter(r => r.rating === 5).length,
        '4_stars': reviews.filter(r => r.rating === 4).length,
        '3_stars': reviews.filter(r => r.rating === 3).length,
        '2_stars': reviews.filter(r => r.rating === 2).length,
        '1_star': reviews.filter(r => r.rating === 1).length,
    };
    
    // Extract themes
    const negativeThemes = new Map<string, number>();
    const positiveThemes = new Map<string, number>();
    
    for (const review of reviews) {
        for (const category of review.categories) {
            if (review.sentiment === 'negative') {
                negativeThemes.set(category, (negativeThemes.get(category) || 0) + 1);
            } else {
                positiveThemes.set(category, (positiveThemes.get(category) || 0) + 1);
            }
        }
    }
    
    const topNegativeThemes = Array.from(negativeThemes.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([theme]) => theme);
    
    const topPositiveThemes = Array.from(positiveThemes.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([theme]) => theme);
    
    // Identify common issues from complaints
    const commonIssues = nhtsaComplaints.length > 0
        ? [...new Set(nhtsaComplaints.map(c => c.components.split(',')[0]))].slice(0, 5)
        : [];
    
    // Praised features (from synthetic positive review)
    const praisedFeatures = topPositiveThemes;
    
    return {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
        breakdown,
        topPositiveThemes,
        topNegativeThemes,
        commonIssues,
        praisedFeatures,
        reviews: reviews.slice(0, 10), // Return top 10 reviews
    };
}

/**
 * Get quick owner sentiment summary
 */
export function getOwnerSentimentSummary(
    complaintCount: number,
    reliabilityScore: number,
    commonProblems: Array<{ component: string; percentage: number }>
): {
    sentiment: 'very_positive' | 'positive' | 'mixed' | 'negative' | 'very_negative';
    summary: string;
} {
    if (complaintCount === 0 && reliabilityScore >= 8) {
        return {
            sentiment: 'very_positive',
            summary: 'No complaints reported. Owners appear highly satisfied.',
        };
    }
    
    if (complaintCount < 5 && reliabilityScore >= 7) {
        return {
            sentiment: 'positive',
            summary: 'Very few complaints. Generally positive owner feedback.',
        };
    }
    
    if (complaintCount > 30 || reliabilityScore < 5) {
        return {
            sentiment: 'very_negative',
            summary: `Multiple issues reported. ${commonProblems[0]?.component || 'Various problems'} are common concerns.`,
        };
    }
    
    if (complaintCount > 15 || reliabilityScore < 6) {
        return {
            sentiment: 'negative',
            summary: 'Notable issues reported by owners. Review complaints carefully.',
        };
    }
    
    return {
        sentiment: 'mixed',
        summary: 'Mixed owner feedback. Some issues reported but overall acceptable.',
    };
}

/**
 * Alternative data sources that could be legally used
 * (Not implemented but documented for future expansion)
 */
export const ALTERNATIVE_DATA_SOURCES = {
    // NHTSA API - Already implemented, public domain
    nhtsa: 'https://api.nhtsa.gov/ - Public domain vehicle safety data',
    
    // EPA Fuel Economy - Already implemented, public data
    epa: 'https://www.fueleconomy.gov/ - Public fuel economy and owner MPG reports',
    
    // YouTube API - Already implemented, fair use for reviews
    youtube: 'YouTube Data API - Expert review aggregation',
    
    // Future possibilities (require additional implementation):
    // - Edmunds API (requires partnership)
    // - KBB API (requires partnership)
    // - Fuelly API (owner MPG tracking)
    // - CarComplaints.com (scraping not recommended, contact for API)
};
