import axios from 'axios';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeVideo {
    id: string;
    title: string;
    description: string;
    channelId: string;
    channelTitle: string;
    publishedAt: string;
    thumbnailUrl: string;
    viewCount: number;
    likeCount: number;
    duration: string;
}

export interface YouTubeSearchResult {
    videoId: string;
    title: string;
    description: string;
    channelId: string;
    channelTitle: string;
    publishedAt: string;
    thumbnailUrl: string;
}

// Popular automotive YouTube channels for prioritization
const TRUSTED_CHANNELS = [
    'TheStraightPipes',
    'Doug DeMuro',
    'Throttle House',
    'savagegeese',
    'CarWow',
    'Engineering Explained',
    'The Fast Lane Car',
    'Redline Reviews',
    'Everyday Driver',
    'Motor Trend',
    'Donut Media',
    'Alex on Autos',
];

// Search for car review videos
export async function searchCarReviews(
    year: number,
    make: string,
    model: string,
    maxResults: number = 20
): Promise<YouTubeSearchResult[]> {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
        console.error('YouTube API key not configured');
        return [];
    }

    try {
        const query = `${year} ${make} ${model} review`;
        const response = await axios.get(`${YOUTUBE_API_BASE}/search`, {
            params: {
                part: 'snippet',
                q: query,
                type: 'video',
                videoDuration: 'medium', // 4-20 minutes
                maxResults,
                order: 'relevance',
                key: apiKey,
            },
        });

        return response.data.items.map(
            (item: {
                id: { videoId: string };
                snippet: {
                    title: string;
                    description: string;
                    channelId: string;
                    channelTitle: string;
                    publishedAt: string;
                    thumbnails: { high: { url: string } };
                };
            }) => ({
                videoId: item.id.videoId,
                title: item.snippet.title,
                description: item.snippet.description,
                channelId: item.snippet.channelId,
                channelTitle: item.snippet.channelTitle,
                publishedAt: item.snippet.publishedAt,
                thumbnailUrl:
                    item.snippet.thumbnails.high?.url ||
                    `https://i.ytimg.com/vi/${item.id.videoId}/hqdefault.jpg`,
            })
        );
    } catch (error) {
        console.error('Error searching YouTube:', error);
        return [];
    }
}

// Get detailed video information
export async function getVideoDetails(
    videoIds: string[]
): Promise<YouTubeVideo[]> {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey || videoIds.length === 0) {
        return [];
    }

    try {
        const response = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
            params: {
                part: 'snippet,statistics,contentDetails',
                id: videoIds.join(','),
                key: apiKey,
            },
        });

        return response.data.items.map(
            (item: {
                id: string;
                snippet: {
                    title: string;
                    description: string;
                    channelId: string;
                    channelTitle: string;
                    publishedAt: string;
                    thumbnails: { high: { url: string } };
                };
                statistics: {
                    viewCount: string;
                    likeCount: string;
                };
                contentDetails: {
                    duration: string;
                };
            }) => ({
                id: item.id,
                title: item.snippet.title,
                description: item.snippet.description,
                channelId: item.snippet.channelId,
                channelTitle: item.snippet.channelTitle,
                publishedAt: item.snippet.publishedAt,
                thumbnailUrl:
                    item.snippet.thumbnails.high?.url ||
                    `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`,
                viewCount: parseInt(item.statistics.viewCount) || 0,
                likeCount: parseInt(item.statistics.likeCount) || 0,
                duration: item.contentDetails.duration,
            })
        );
    } catch (error) {
        console.error('Error getting video details:', error);
        return [];
    }
}

// Get reviews from trusted channels only
export async function getTrustedReviews(
    year: number,
    make: string,
    model: string
): Promise<YouTubeVideo[]> {
    const searchResults = await searchCarReviews(year, make, model, 50);

    // Filter for trusted channels
    const trustedResults = searchResults.filter((video) =>
        TRUSTED_CHANNELS.some(
            (channel) =>
                video.channelTitle.toLowerCase().includes(channel.toLowerCase()) ||
                channel.toLowerCase().includes(video.channelTitle.toLowerCase())
        )
    );

    if (trustedResults.length === 0) {
        // Fall back to regular results if no trusted channels found
        const videoIds = searchResults.slice(0, 10).map((v) => v.videoId);
        return getVideoDetails(videoIds);
    }

    const videoIds = trustedResults.slice(0, 10).map((v) => v.videoId);
    return getVideoDetails(videoIds);
}

// Parse ISO 8601 duration to human readable format
export function parseDuration(isoDuration: string): string {
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '0:00';

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds
            .toString()
            .padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Format view count (e.g., 1.2M, 450K)
export function formatViewCount(count: number): string {
    if (count >= 1000000) {
        return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
        return `${(count / 1000).toFixed(0)}K`;
    }
    return count.toString();
}

// Score a video based on relevance and quality
export function scoreVideo(video: YouTubeVideo, year: number, make: string, model: string): number {
    let score = 0;

    // Check if title contains all search terms
    const titleLower = video.title.toLowerCase();
    if (titleLower.includes(year.toString())) score += 10;
    if (titleLower.includes(make.toLowerCase())) score += 10;
    if (titleLower.includes(model.toLowerCase())) score += 10;
    if (titleLower.includes('review')) score += 5;

    // Trusted channel bonus
    if (TRUSTED_CHANNELS.some((c) => video.channelTitle.toLowerCase().includes(c.toLowerCase()))) {
        score += 20;
    }

    // Engagement metrics (normalized)
    score += Math.min(video.viewCount / 100000, 10);
    score += Math.min((video.likeCount / video.viewCount) * 100, 10);

    return score;
}
