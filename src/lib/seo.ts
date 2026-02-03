import { Metadata } from 'next';

// Base site configuration
export const SITE_CONFIG = {
  name: 'CARAG',
  description: 'Objective car research platform with government safety data, owner complaints, fuel economy, and expert reviews. Make smarter car buying decisions.',
  url: 'https://carag.com', // Update with your actual domain
  ogImage: '/og-image.jpg',
  twitterHandle: '@carag',
};

// Generate metadata for vehicle pages
export function generateVehicleMetadata(
  year: number,
  make: string,
  model: string,
  reliabilityScore?: number,
  complaintCount?: number,
  recallCount?: number
): Metadata {
  const title = `${year} ${make} ${model} Reliability, Safety & Ownership Cost | CARAG`;
  
  let description = `Research the ${year} ${make} ${model} with CARAG. `;
  
  if (reliabilityScore !== undefined) {
    description += `Reliability Score: ${reliabilityScore}/10. `;
  }
  if (complaintCount !== undefined) {
    description += `${complaintCount} NHTSA complaints. `;
  }
  if (recallCount !== undefined) {
    description += `${recallCount} safety recalls. `;
  }
  
  description += 'View owner complaints, safety recalls, fuel economy, total cost of ownership, and expert video reviews. Data from NHTSA and EPA.';

  return {
    title,
    description,
    keywords: [
      `${year} ${make} ${model}`,
      `${make} ${model} reliability`,
      `${make} ${model} problems`,
      `${make} ${model} complaints`,
      `${make} ${model} recalls`,
      `${make} ${model} review`,
      'car research',
      'vehicle reliability',
      'NHTSA complaints',
      'car safety ratings',
      'ownership cost',
    ],
    openGraph: {
      title,
      description,
      type: 'article',
      url: `${SITE_CONFIG.url}/vehicle/${year}/${encodeURIComponent(make)}/${encodeURIComponent(model)}`,
      siteName: SITE_CONFIG.name,
      images: [{
        url: `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`,
        width: 1200,
        height: 630,
        alt: `${year} ${make} ${model} on CARAG`,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`],
      creator: SITE_CONFIG.twitterHandle,
    },
    alternates: {
      canonical: `${SITE_CONFIG.url}/vehicle/${year}/${encodeURIComponent(make)}/${encodeURIComponent(model)}`,
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  };
}

// Generate compare page metadata
export function generateCompareMetadata(): Metadata {
  const title = 'Compare Vehicles Side-by-Side | Reliability & Cost | CARAG';
  const description = 'Compare up to 3 vehicles side-by-side. See reliability scores, NHTSA complaints, safety recalls, fuel economy, and 5-year ownership costs. Make informed car buying decisions with government data.';

  return {
    title,
    description,
    keywords: [
      'car comparison',
      'compare cars',
      'vehicle comparison tool',
      'side by side car comparison',
      'compare reliability',
      'car buying guide',
    ],
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${SITE_CONFIG.url}/compare`,
      siteName: SITE_CONFIG.name,
    },
    alternates: {
      canonical: `${SITE_CONFIG.url}/compare`,
    },
  };
}

// Generate JSON-LD structured data for vehicles
export function generateVehicleStructuredData(
  year: number,
  make: string,
  model: string,
  reliabilityScore: number,
  complaintCount: number,
  recallCount: number,
  variants: Array<{
    cityMpg?: number;
    highwayMpg?: number;
    combinedMpg?: number;
    fuelType?: string;
  }>
): Record<string, unknown> {
  const vehicleName = `${year} ${make} ${model}`;
  const bestMpg = variants.length > 0 
    ? Math.max(...variants.map(v => v.combinedMpg || 0))
    : null;

  return {
    '@context': 'https://schema.org',
    '@type': 'Vehicle',
    name: vehicleName,
    vehicleModelDate: year.toString(),
    manufacturer: {
      '@type': 'Organization',
      name: make,
    },
    model: model,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: reliabilityScore.toString(),
      bestRating: '10',
      worstRating: '0',
      reviewCount: complaintCount.toString(),
    },
    // Fuel economy if available
    ...(bestMpg && {
      fuelConsumption: {
        '@type': 'QuantitativeValue',
        value: bestMpg.toString(),
        unitCode: 'MPG',
      },
    }),
    // Additional property for recalls
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'NHTSA Safety Recalls',
        value: recallCount.toString(),
      },
      {
        '@type': 'PropertyValue',
        name: 'NHTSA Owner Complaints',
        value: complaintCount.toString(),
      },
    ],
  };
}

// Generate FAQ structured data
export function generateFAQStructuredData(faqs: Array<{ question: string; answer: string }>): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

// Generate BreadcrumbList structured data
export function generateBreadcrumbStructuredData(
  items: Array<{ name: string; url: string }>
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_CONFIG.url}${item.url}`,
    })),
  };
}

// Generate WebSite structured data
export function generateWebsiteStructuredData(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_CONFIG.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// Generate Organization structured data
export function generateOrganizationStructuredData(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/logo.png`,
    sameAs: [
      // Add your social media URLs here
      // 'https://twitter.com/carag',
      // 'https://facebook.com/carag',
    ],
  };
}

// Popular vehicle slugs for static generation
export const POPULAR_VEHICLES = [
  { year: 2024, make: 'Toyota', model: 'Camry' },
  { year: 2024, make: 'Honda', model: 'CR-V' },
  { year: 2024, make: 'Tesla', model: 'Model 3' },
  { year: 2024, make: 'Ford', model: 'F-150' },
  { year: 2024, make: 'Toyota', model: 'Corolla' },
  { year: 2024, make: 'Lexus', model: 'ES' },
  { year: 2024, make: 'Mazda', model: 'CX-5' },
  { year: 2024, make: 'Honda', model: 'Accord' },
  { year: 2024, make: 'Toyota', model: 'RAV4' },
  { year: 2024, make: 'Honda', model: 'Civic' },
  { year: 2023, make: 'Toyota', model: 'Camry' },
  { year: 2023, make: 'Honda', model: 'CR-V' },
  { year: 2023, make: 'Ford', model: 'F-150' },
  { year: 2023, make: 'Toyota', model: 'Corolla' },
  { year: 2023, make: 'Tesla', model: 'Model Y' },
  { year: 2022, make: 'Toyota', model: 'Camry' },
  { year: 2022, make: 'Honda', model: 'CR-V' },
  { year: 2022, make: 'Ford', model: 'F-150' },
  { year: 2021, make: 'Toyota', model: 'Camry' },
  { year: 2021, make: 'Honda', model: 'CR-V' },
  { year: 2020, make: 'Toyota', model: 'Camry' },
  { year: 2020, make: 'Honda', model: 'CR-V' },
];
