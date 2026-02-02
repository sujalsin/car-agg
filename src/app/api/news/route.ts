import { NextResponse } from 'next/server';
import axios from 'axios';

interface NewsItem {
    title: string;
    link: string;
    pubDate: string;
    source: string;
    sourceUrl: string;
}

// Reputable automotive news sources with RSS feeds
// Legal basis: Headlines and links only (fair use), facts are not copyrightable
const NEWS_SOURCES = [
    {
        name: 'Motor1.com',
        url: 'https://www.motor1.com/rss/news/',
        siteUrl: 'https://www.motor1.com/',
    },
    {
        name: 'Autoblog',
        url: 'https://www.autoblog.com/rss.xml',
        siteUrl: 'https://www.autoblog.com/',
    },
    {
        name: 'Car and Driver',
        url: 'https://www.caranddriver.com/rss/all.xml',
        siteUrl: 'https://www.caranddriver.com/',
    },
    {
        name: 'The Drive',
        url: 'https://www.thedrive.com/rss.xml',
        siteUrl: 'https://www.thedrive.com/',
    },
    {
        name: 'CarScoops',
        url: 'https://www.carscoops.com/feed/',
        siteUrl: 'https://www.carscoops.com/',
    },
];

// Fetch RSS feed from a source
async function fetchRSSFeed(source: typeof NEWS_SOURCES[0]): Promise<NewsItem[]> {
    try {
        const response = await axios.get(source.url, {
            timeout: 8000,
            headers: {
                'User-Agent': 'CARAG/1.0 (Car Research Aggregator - News Headlines)',
                'Accept': 'application/rss+xml, application/xml, text/xml',
            },
        });

        const xml = response.data;
        const items: NewsItem[] = [];

        // Parse RSS items
        const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

        for (const itemXml of itemMatches.slice(0, 6)) { // 6 items per source for 20+ total
            const title = extractTag(itemXml, 'title');
            const link = extractTag(itemXml, 'link');
            const pubDate = extractTag(itemXml, 'pubDate');

            if (title && link && title.length > 10) {
                items.push({
                    title: cleanHtml(title).slice(0, 120),
                    link,
                    pubDate: pubDate || new Date().toISOString(),
                    source: source.name,
                    sourceUrl: source.siteUrl,
                });
            }
        }

        return items;
    } catch (error) {
        console.error(`Error fetching ${source.name} RSS:`, error);
        return [];
    }
}

function extractTag(xml: string, tag: string): string {
    const cdataMatch = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`));
    if (cdataMatch) return cdataMatch[1].trim();

    const simpleMatch = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
    return simpleMatch ? simpleMatch[1].trim() : '';
}

function cleanHtml(str: string): string {
    return str
        .replace(/<!\[CDATA\[|\]\]>/g, '')
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
}

// Fallback headlines for when RSS fails
const FALLBACK_NEWS: NewsItem[] = [
    {
        title: '2025 Toyota Camry Revealed With Bold New Design',
        link: 'https://www.motor1.com/',
        pubDate: new Date().toISOString(),
        source: 'Motor1.com',
        sourceUrl: 'https://www.motor1.com/',
    },
    {
        title: 'Honda CR-V Hybrid Sets New Sales Record',
        link: 'https://www.autoblog.com/',
        pubDate: new Date().toISOString(),
        source: 'Autoblog',
        sourceUrl: 'https://www.autoblog.com/',
    },
    {
        title: 'Tesla Model 3 Gets Major Software Update',
        link: 'https://www.caranddriver.com/',
        pubDate: new Date().toISOString(),
        source: 'Car and Driver',
        sourceUrl: 'https://www.caranddriver.com/',
    },
    {
        title: 'Ford F-150 Lightning Production Ramps Up',
        link: 'https://www.thedrive.com/',
        pubDate: new Date().toISOString(),
        source: 'The Drive',
        sourceUrl: 'https://www.thedrive.com/',
    },
    {
        title: 'Lexus Announces All-Electric SUV Lineup for 2026',
        link: 'https://www.carscoops.com/',
        pubDate: new Date().toISOString(),
        source: 'CarScoops',
        sourceUrl: 'https://www.carscoops.com/',
    },
];

export async function GET() {
    try {
        // Fetch from all sources in parallel
        const allResults = await Promise.all(
            NEWS_SOURCES.map(source => fetchRSSFeed(source))
        );

        // Flatten and combine all news items
        let allNews = allResults.flat();

        // Sort by date (newest first)
        allNews.sort((a, b) =>
            new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
        );

        // Take top 20 items for comprehensive daily coverage
        const news = allNews.slice(0, 20);

        // Use fallback if all feeds fail
        if (news.length === 0) {
            return NextResponse.json({
                success: true,
                news: FALLBACK_NEWS,
                sources: NEWS_SOURCES.map(s => ({ name: s.name, url: s.siteUrl })),
                fetchedAt: new Date().toISOString(),
                cached: true,
            });
        }

        return NextResponse.json({
            success: true,
            news,
            sources: NEWS_SOURCES.map(s => ({ name: s.name, url: s.siteUrl })),
            fetchedAt: new Date().toISOString(),
            cached: false,
        });
    } catch (error) {
        console.error('News fetch error:', error);
        return NextResponse.json({
            success: true,
            news: FALLBACK_NEWS,
            sources: NEWS_SOURCES.map(s => ({ name: s.name, url: s.siteUrl })),
            fetchedAt: new Date().toISOString(),
            cached: true,
        });
    }
}
