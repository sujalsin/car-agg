'use client';

import { cn } from '@/lib/utils';
import { Play, Eye, ThumbsUp, Clock, ExternalLink } from 'lucide-react';
import Image from 'next/image';

interface YouTubeVideo {
    id: string;
    title: string;
    channelName: string;
    thumbnail: string;
    viewCount: number;
    publishedAt: string;
    duration: string;
}

interface YouTubeReviewsProps {
    videos: YouTubeVideo[];
    className?: string;
}

export function YouTubeReviews({ videos, className }: YouTubeReviewsProps) {
    const formatViews = (count: number): string => {
        if (count >= 1000000) {
            return `${(count / 1000000).toFixed(1)}M`;
        }
        if (count >= 1000) {
            return `${(count / 1000).toFixed(0)}K`;
        }
        return count.toString();
    };

    const formatDuration = (isoDuration: string): string => {
        const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!match) return '0:00';

        const hours = parseInt(match[1] || '0');
        const minutes = parseInt(match[2] || '0');
        const seconds = parseInt(match[3] || '0');

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
    };

    if (videos.length === 0) {
        return (
            <div className={cn('p-6 rounded-lg bg-muted/50 text-center', className)}>
                <Play className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                    No reviews found for this vehicle.
                </p>
            </div>
        );
    }

    return (
        <div className={cn('space-y-4', className)}>
            <div className="grid gap-4">
                {videos.map((video, index) => (
                    <a
                        key={video.id}
                        href={`https://www.youtube.com/watch?v=${video.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex gap-4 p-3 rounded-lg bg-card border border-border hover:border-primary/50 transition-all card-hover animate-fadeIn"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        {/* Thumbnail */}
                        <div className="relative flex-shrink-0 w-40 aspect-video rounded-md overflow-hidden bg-muted">
                            <Image
                                src={video.thumbnail}
                                alt={video.title}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform scale-90 group-hover:scale-100">
                                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                                </div>
                            </div>
                            {/* Duration badge */}
                            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 rounded text-xs text-white font-medium">
                                {formatDuration(video.duration)}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 py-1">
                            <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                                {video.title}
                            </h4>

                            <p className="text-xs text-muted-foreground mt-1">
                                {video.channelName}
                            </p>

                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Eye className="w-3 h-3" />
                                    {formatViews(video.viewCount)} views
                                </span>
                                <span>•</span>
                                <span>{formatDate(video.publishedAt)}</span>
                            </div>
                        </div>

                        {/* External link indicator */}
                        <div className="flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        </div>
                    </a>
                ))}
            </div>

            <p className="text-xs text-muted-foreground text-center">
                Videos from YouTube. Click to watch in a new tab.
            </p>
        </div>
    );
}
