import { MetadataRoute } from 'next';
import { POPULAR_VEHICLES } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://carag.com'; // Update with your actual domain
    
    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/compare`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/disclaimer`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.3,
        },
    ];
    
    // Popular vehicle pages
    const vehiclePages: MetadataRoute.Sitemap = POPULAR_VEHICLES.map(vehicle => ({
        url: `${baseUrl}/vehicle/${vehicle.year}/${encodeURIComponent(vehicle.make)}/${encodeURIComponent(vehicle.model)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));
    
    // Year pages
    const currentYear = new Date().getFullYear();
    const yearPages: MetadataRoute.Sitemap = [];
    for (let year = currentYear - 4; year <= currentYear + 1; year++) {
        yearPages.push({
            url: `${baseUrl}/vehicle/${year}`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        });
    }
    
    return [...staticPages, ...vehiclePages, ...yearPages];
}
