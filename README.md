# CARAG - Car Research Aggregator

A comprehensive vehicle research platform that aggregates safety data, reliability scores, ownership costs, and expert reviews to help consumers make informed car buying decisions.

## 🌟 Features

### Vehicle Research
- **Reliability Scores** - Algorithmically calculated from NHTSA complaint and recall data
- **Safety Information** - NHTSA complaints and safety recalls with severity breakdown
- **Fuel Economy** - EPA data with real-world MPG reports from owners
- **Ownership Costs** - 5-year cost estimates including fuel, insurance, maintenance, repairs, and depreciation
- **Expert Reviews** - Curated YouTube video reviews from trusted automotive channels

### Search & Comparison
- **VIN Decoder** - Decode any 17-character VIN using NHTSA VPIC
- **Year/Make/Model Search** - Browse vehicles from 1985 to present
- **Side-by-Side Comparison** - Compare up to 3 vehicles on reliability, costs, and features

### Data Sources (All Legal)
| Source | Data | Legal Basis |
|--------|------|-------------|
| **NHTSA** | Complaints, recalls, VIN decoding | U.S. Government public data (17 U.S.C. § 105) |
| **EPA** | Fuel economy, real-world MPG | U.S. Government public data |
| **YouTube** | Expert video reviews | YouTube Data API, Terms of Service compliant |
| **News RSS** | Automotive news headlines | Fair use, facts not copyrightable |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (for caching)
- YouTube Data API key (optional, for video reviews)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/carag.git
cd carag
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional (for YouTube reviews)
YOUTUBE_API_KEY=your_youtube_api_key
```

4. Set up the database:
   - Create a new Supabase project
   - Run the SQL from `supabase/migration.sql` in the SQL Editor
   - Run `supabase/add_cache_tables.sql` if upgrading

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Database**: Supabase (PostgreSQL)
- **Caching**: Multi-layer (CDN + Supabase)

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── vehicles/      # Vehicle data endpoint
│   │   ├── compare/       # Comparison endpoint
│   │   ├── search/        # Search endpoints
│   │   ├── news/          # News aggregation
│   │   └── vin/           # VIN decoder
│   ├── vehicle/           # Vehicle detail pages
│   │   ├── [year]/
│   │   │   ├── [make]/
│   │   │   │   └── [model]/
│   │   │   └── page.tsx   # Year listing
│   │   └── page.tsx       # Make listing
│   ├── compare/           # Comparison tool
│   ├── terms/             # Terms of Service
│   ├── disclaimer/        # Disclaimer
│   ├── page.tsx           # Home page
│   ├── layout.tsx         # Root layout
│   ├── sitemap.ts         # Sitemap generator
│   └── robots.ts          # Robots.txt generator
├── components/            # React components
│   ├── CostCalculator.tsx
│   ├── ScoreGauge.tsx
│   ├── SafetyTimeline.tsx
│   ├── WhatBreaks.tsx
│   └── YouTubeReviews.tsx
├── lib/                   # Utilities & business logic
│   ├── seo.ts             # SEO utilities
│   ├── rate-limit.ts      # API rate limiting
│   ├── vehicle-pricing.ts # MSRP estimation
│   ├── ownership-cost.ts  # TCO calculations
│   ├── reliability-score.ts
│   └── common-problems.ts
├── services/              # External API services
│   ├── nhtsa.ts          # NHTSA API client
│   ├── epa.ts            # EPA API client
│   ├── youtube.ts        # YouTube API client
│   ├── cache.ts          # Caching layer
│   └── owner-reviews.ts  # Review aggregation
└── types/                # TypeScript types

supabase/
├── migration.sql         # Database schema
└── add_cache_tables.sql  # Cache tables
```

## 🔒 Legal Compliance

### Data Usage
All data sources are used legally:

1. **NHTSA Data**: Public domain under U.S. law (17 U.S.C. § 105)
2. **EPA Data**: Public domain government data
3. **YouTube**: Official API with quota compliance
4. **News**: RSS feeds, headlines only (fair use)

### Rate Limiting
- API routes implement rate limiting to comply with external API terms
- NHTSA: No strict limits but we cache aggressively
- YouTube: 10,000 quota units per day
- Internal: 30 requests/minute per IP for expensive endpoints

### Disclaimer
All CARAG-generated data (reliability scores, ownership costs, pros/cons) are clearly labeled as estimates. The platform includes comprehensive disclaimers about data limitations.

## ⚡ Performance & Caching

### Caching Strategy
| Data Type | Cache Duration | Location |
|-----------|---------------|----------|
| Vehicle Data | 24 hours | Supabase + CDN |
| NHTSA Complaints | 48 hours | Supabase |
| NHTSA Recalls | 48 hours | Supabase |
| YouTube Videos | 7 days | Supabase |
| Fuel Prices | 6 hours | Supabase |
| News | 30 minutes | Supabase |

### CDN Configuration
- Static assets: 1 year cache
- API responses: `s-maxage` with stale-while-revalidate
- Images: WebP/AVIF format optimization

## 📊 Total Cost of Ownership (TCO)

The TCO calculator estimates:
- **Fuel Costs**: Based on EPA MPG + current regional fuel prices
- **Insurance**: State averages adjusted for vehicle class and MSRP
- **Maintenance**: Vehicle class + brand multipliers
- **Repairs**: Based on complaint rate from NHTSA data
- **Depreciation**: Brand retention rates + age calculations

### MSRP Estimation
Since exact MSRP isn't always available, we estimate based on:
- Make and model historical pricing
- Vehicle class
- Model year
- Trim level

## 🔍 SEO Optimization

### Implemented Features
- Dynamic metadata for all vehicle pages
- JSON-LD structured data (Vehicle, FAQ, Breadcrumb, WebSite)
- XML sitemap generation
- robots.txt with proper directives
- Canonical URLs
- Open Graph and Twitter Card meta tags

### Popular Vehicle Pages
Static generation for 20+ popular vehicles ensures fast load times and better indexing.

## 🛠️ Development

### Build for Production
```bash
npm run build
```

### Run Linter
```bash
npm run lint
```

### Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `YOUTUBE_API_KEY` | No | YouTube Data API key |

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Self-Hosted
1. Build: `npm run build`
2. Start: `npm start`
3. Ensure environment variables are set

## 📝 API Documentation

### GET /api/vehicles
Fetch complete vehicle data including reliability, complaints, recalls, and costs.

**Parameters:**
- `year` (required): Vehicle year (1980+)
- `make` (required): Vehicle make
- `model` (required): Vehicle model

**Response:**
```json
{
  "year": 2024,
  "make": "Toyota",
  "model": "Camry",
  "reliabilityScore": {
    "overall": 8.5,
    "components": [...],
    "complaintCount": 12,
    "recallCount": 1
  },
  "ownershipCost": {
    "totalAnnualCost": 7200,
    "fuelCost": 1800,
    "insuranceCost": 1500,
    "maintenanceCost": 900,
    "repairCost": 400,
    "depreciation": 2600,
    "fiveYearCost": 36000
  }
}
```

### POST /api/compare
Compare multiple vehicles side-by-side.

**Body:**
```json
{
  "vehicles": [
    { "year": 2024, "make": "Toyota", "model": "Camry" },
    { "year": 2024, "make": "Honda", "model": "Accord" }
  ]
}
```

### GET /api/vin
Decode a VIN to get vehicle specifications.

**Parameters:**
- `vin` (required): 17-character VIN

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is open source under the MIT License.

## 🙏 Acknowledgments

- NHTSA for providing public vehicle safety data
- EPA for fuel economy data
- YouTube for video content via official API
- Automotive journalists and reviewers

---

**Disclaimer**: CARAG is not affiliated with NHTSA, EPA, or any vehicle manufacturer. All reliability scores and cost estimates are CARAG calculations based on publicly available data.
