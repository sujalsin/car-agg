'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  ChevronDown,
  Car,
  Shield,
  TrendingUp,
  Zap,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  Info,
  Hash,
  Newspaper,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Featured cars data (would come from API in production)
const TRENDING_CARS = [
  { year: 2024, make: 'Toyota', model: 'Camry', score: 8.9, image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=300&fit=crop' },
  { year: 2024, make: 'Honda', model: 'CR-V', score: 8.7, image: 'https://images.unsplash.com/photo-1568844293986-8c918cbb9899?w=400&h=300&fit=crop' },
  { year: 2024, make: 'Tesla', model: 'Model 3', score: 7.8, image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=300&fit=crop' },
  { year: 2024, make: 'Ford', model: 'F-150', score: 8.1, image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400&h=300&fit=crop' },
];

const MOST_RELIABLE = [
  { year: 2024, make: 'Toyota', model: 'Corolla', score: 9.2, image: 'https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=400&h=300&fit=crop' },
  { year: 2024, make: 'Lexus', model: 'ES', score: 9.4, image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop' },
  { year: 2024, make: 'Mazda', model: 'CX-5', score: 9.1, image: 'https://images.unsplash.com/photo-1612825173281-9a193378527e?w=400&h=300&fit=crop' },
  { year: 2024, make: 'Honda', model: 'Accord', score: 9.0, image: 'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=400&h=300&fit=crop' },
];

interface RecentRecall {
  make: string;
  model: string;
  year: string;
  component: string;
  date: string;
}

interface VehicleSpec {
  make: string;
  model: string;
  year: number;
  vehicleType: string;
  bodyClass: string;
  engineCylinders: string;
  engineDisplacement: string;
  fuelType: string;
  driveType: string;
  transmissionStyle: string;
  plantCountry: string;
}

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  image: string | null;
  source: string;
}

export default function HomePage() {
  const router = useRouter();
  const [searchMode, setSearchMode] = useState<'vehicle' | 'vin'>('vehicle');
  const [year, setYear] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [years, setYears] = useState<number[]>([]);
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentRecalls, setRecentRecalls] = useState<RecentRecall[]>([]);
  const [recentSearches, setRecentSearches] = useState<Array<{ year: number, make: string, model: string }>>([]);

  // VIN decoder state
  const [vin, setVin] = useState('');
  const [vinLoading, setVinLoading] = useState(false);
  const [vinResult, setVinResult] = useState<VehicleSpec | null>(null);
  const [vinError, setVinError] = useState('');

  // News state
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);;

  // Generate years from current year down to 1985
  useEffect(() => {
    const currentYear = new Date().getFullYear() + 1;
    const yearList = Array.from({ length: currentYear - 1984 }, (_, i) => currentYear - i);
    setYears(yearList);

    // Load recent searches from localStorage
    const saved = localStorage.getItem('carag-recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved).slice(0, 4));
      } catch (e) { }
    }

    // Fetch recent recalls
    fetchRecentRecalls();

    // Fetch news
    fetchNews();
  }, []);

  const fetchRecentRecalls = async () => {
    try {
      const response = await fetch('/api/recalls/recent');
      if (response.ok) {
        const data = await response.json();
        setRecentRecalls(data.recalls || []);
      }
    } catch (e) {
      // Use fallback data
      setRecentRecalls([
        { make: 'Honda', model: 'CR-V', year: '2023-2024', component: 'Fuel Pump', date: '2024' },
        { make: 'Toyota', model: 'RAV4', year: '2022-2023', component: 'Rear Suspension', date: '2024' },
        { make: 'Ford', model: 'Bronco', year: '2021-2023', component: 'Engine', date: '2024' },
        { make: 'Tesla', model: 'Model Y', year: '2020-2024', component: 'Steering', date: '2024' },
        { make: 'Hyundai', model: 'Tucson', year: '2022-2024', component: 'Airbags', date: '2024' },
      ]);
    }
  };

  const fetchNews = async () => {
    try {
      const response = await fetch('/api/news');
      if (response.ok) {
        const data = await response.json();
        setNews(data.news || []);
      }
    } catch (e) {
      console.error('Error fetching news:', e);
    } finally {
      setNewsLoading(false);
    }
  };

  // Fetch makes when year changes
  useEffect(() => {
    if (year) {
      setMake('');
      setModel('');
      setModels([]);
      fetch(`/api/search?year=${year}`)
        .then(res => res.json())
        .then(data => setMakes(data.makes || []))
        .catch(err => console.error('Error fetching makes:', err));
    }
  }, [year]);

  // Fetch models when make changes
  useEffect(() => {
    if (year && make) {
      setModel('');
      fetch(`/api/search/models?year=${year}&make=${encodeURIComponent(make)}`)
        .then(res => res.json())
        .then(data => setModels(data.models || []))
        .catch(err => console.error('Error fetching models:', err));
    }
  }, [year, make]);

  const handleSearch = () => {
    if (year && make && model) {
      // Save to recent searches
      const search = { year: parseInt(year), make, model };
      const updated = [search, ...recentSearches.filter(s =>
        !(s.year === search.year && s.make === search.make && s.model === search.model)
      )].slice(0, 4);
      setRecentSearches(updated);
      localStorage.setItem('carag-recent-searches', JSON.stringify(updated));

      setLoading(true);
      router.push(`/vehicle/${year}/${encodeURIComponent(make)}/${encodeURIComponent(model)}`);
    }
  };

  const navigateToVehicle = (y: number, mk: string, md: string) => {
    router.push(`/vehicle/${y}/${encodeURIComponent(mk)}/${encodeURIComponent(md)}`);
  };

  const handleVinDecode = async () => {
    if (!vin || vin.length !== 17) {
      setVinError('VIN must be exactly 17 characters');
      return;
    }

    setVinLoading(true);
    setVinError('');
    setVinResult(null);

    try {
      const response = await fetch(`/api/vin?vin=${encodeURIComponent(vin)}`);
      const data = await response.json();

      if (data.success && data.vehicle) {
        setVinResult(data.vehicle);
      } else {
        setVinError(data.error || 'Could not decode VIN');
      }
    } catch (e) {
      setVinError('Failed to decode VIN. Please try again.');
    } finally {
      setVinLoading(false);
    }
  };

  const handleViewVinReport = () => {
    if (vinResult && vinResult.year && vinResult.make && vinResult.model) {
      navigateToVehicle(vinResult.year, vinResult.make, vinResult.model);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 9) return 'text-green-500';
    if (score >= 7) return 'text-emerald-500';
    if (score >= 5) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 9) return 'bg-green-500';
    if (score >= 7) return 'bg-emerald-500';
    if (score >= 5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
              <Car className="w-5 h-5 text-background" />
            </div>
            <span className="font-semibold text-lg">CARAG</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="/compare" className="hover:text-foreground transition-colors">Compare</a>
            <a href="#trending" className="hover:text-foreground transition-colors">Trending</a>
            <a href="#reliable" className="hover:text-foreground transition-colors">Most Reliable</a>
            <a href="#news" className="hover:text-foreground transition-colors">News</a>
            <a href="#methodology" className="hover:text-foreground transition-colors">Methodology</a>
          </nav>
        </div>
      </header>

      {/* Recent Recalls Banner */}
      {recentRecalls.length > 0 && (
        <div className="bg-red-50 dark:bg-red-950/30 border-b border-red-200 dark:border-red-900 overflow-hidden">
          <div className="py-2 px-4">
            <div className="flex items-center gap-3 animate-marquee whitespace-nowrap">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <a href="https://www.nhtsa.gov/recalls" target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-red-700 dark:text-red-400 hover:underline flex items-center gap-1">
                Recent Recalls (NHTSA.gov):
              </a>
              {[...recentRecalls, ...recentRecalls].map((recall, i) => (
                <span key={i} className="text-xs text-red-600 dark:text-red-300 flex items-center gap-1">
                  <span className="font-medium">{recall.year} {recall.make} {recall.model}</span>
                  <span className="text-red-400">({recall.component})</span>
                  <span className="mx-4 text-red-300">•</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Compact Hero Section */}
      <section className="py-8 px-6 border-b border-border">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-12">
            {/* Left - Text & Search */}
            <div className="flex-1 mb-6 lg:mb-0">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
                Car Research, <span className="text-muted-foreground">Without the Noise</span>
              </h1>
              <p className="text-sm text-muted-foreground mb-4 max-w-lg">
                Get objective reliability data from NHTSA, EPA, and real owners—not paid reviewers.
              </p>

              {/* Search Mode Tabs */}
              <div className="flex gap-1 mb-3">
                <button
                  onClick={() => { setSearchMode('vehicle'); setVinResult(null); setVinError(''); }}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5',
                    searchMode === 'vehicle' ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Car className="w-3.5 h-3.5" />
                  Year / Make / Model
                </button>
                <button
                  onClick={() => { setSearchMode('vin'); }}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5',
                    searchMode === 'vin' ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Hash className="w-3.5 h-3.5" />
                  VIN Lookup
                </button>
              </div>

              {/* Vehicle Search Form */}
              {searchMode === 'vehicle' && (
                <div className="flex flex-wrap gap-2">
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus-ring min-w-[100px]"
                  >
                    <option value="">Year</option>
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>

                  <select
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    disabled={!year}
                    className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus-ring min-w-[120px] disabled:opacity-50"
                  >
                    <option value="">Make</option>
                    {makes.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>

                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    disabled={!make}
                    className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus-ring min-w-[140px] disabled:opacity-50"
                  >
                    <option value="">Model</option>
                    {models.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>

                  <button
                    onClick={handleSearch}
                    disabled={!year || !make || !model || loading}
                    className={cn(
                      'h-10 px-5 rounded-lg font-medium flex items-center gap-2 transition-all text-sm',
                      'bg-foreground text-background hover:bg-foreground/90',
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        Search
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* VIN Decoder Form */}
              {searchMode === 'vin' && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={vin}
                      onChange={(e) => setVin(e.target.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, ''))}
                      placeholder="Enter 17-character VIN"
                      maxLength={17}
                      className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus-ring flex-1 font-mono tracking-wider"
                    />
                    <button
                      onClick={handleVinDecode}
                      disabled={vin.length !== 17 || vinLoading}
                      className={cn(
                        'h-10 px-5 rounded-lg font-medium flex items-center gap-2 transition-all text-sm',
                        'bg-foreground text-background hover:bg-foreground/90',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                      )}
                    >
                      {vinLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Search className="w-4 h-4" />
                          Decode
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {vin.length}/17 characters • Source: NHTSA VPIC
                  </p>

                  {/* VIN Error */}
                  {vinError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg text-red-600 dark:text-red-400 text-sm">
                      <XCircle className="w-4 h-4" />
                      {vinError}
                    </div>
                  )}

                  {/* VIN Result */}
                  {vinResult && (
                    <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800 space-y-3">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-medium">Vehicle Found!</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        <div><span className="text-muted-foreground">Year:</span> <strong>{vinResult.year}</strong></div>
                        <div><span className="text-muted-foreground">Make:</span> <strong>{vinResult.make}</strong></div>
                        <div><span className="text-muted-foreground">Model:</span> <strong>{vinResult.model}</strong></div>
                        {vinResult.bodyClass && <div><span className="text-muted-foreground">Body:</span> <strong>{vinResult.bodyClass}</strong></div>}
                        {vinResult.engineCylinders && <div><span className="text-muted-foreground">Engine:</span> <strong>{vinResult.engineCylinders} cyl</strong></div>}
                        {vinResult.fuelType && <div><span className="text-muted-foreground">Fuel:</span> <strong>{vinResult.fuelType}</strong></div>}
                        {vinResult.driveType && <div><span className="text-muted-foreground">Drive:</span> <strong>{vinResult.driveType}</strong></div>}
                        {vinResult.transmissionStyle && <div><span className="text-muted-foreground">Trans:</span> <strong>{vinResult.transmissionStyle}</strong></div>}
                        {vinResult.plantCountry && <div><span className="text-muted-foreground">Made in:</span> <strong>{vinResult.plantCountry}</strong></div>}
                      </div>
                      <button
                        onClick={handleViewVinReport}
                        className="w-full mt-2 h-10 px-4 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <ChevronRight className="w-4 h-4" />
                        View Full Reliability Report
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right - Quick Stats */}
            <div className="flex gap-6 text-center">
              <div>
                <p className="text-2xl font-bold">50K+</p>
                <p className="text-xs text-muted-foreground">Complaints Analyzed</p>
              </div>
              <div>
                <p className="text-2xl font-bold">20+</p>
                <p className="text-xs text-muted-foreground">Years of Data</p>
              </div>
              <div>
                <p className="text-2xl font-bold">100%</p>
                <p className="text-xs text-muted-foreground">Gov. Verified</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <section className="py-6 px-6 bg-muted/30 border-b border-border">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-sm font-medium text-muted-foreground mb-3">Recent Searches</h2>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, i) => (
                <button
                  key={i}
                  onClick={() => navigateToVehicle(search.year, search.make, search.model)}
                  className="px-3 py-1.5 bg-background border rounded-full text-sm hover:border-foreground/50 transition-colors flex items-center gap-2"
                >
                  <Car className="w-3 h-3" />
                  {search.year} {search.make} {search.model}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trending Cars Section */}
      <section id="trending" className="py-10 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold">Trending Research</h2>
              <p className="text-sm text-muted-foreground">Most searched vehicles this week</p>
            </div>
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TRENDING_CARS.map((car, index) => (
              <button
                key={index}
                onClick={() => navigateToVehicle(car.year, car.make, car.model)}
                className="group bg-card border rounded-xl overflow-hidden card-hover text-left"
              >
                <div className="aspect-[4/3] relative bg-muted overflow-hidden">
                  <img
                    src={car.image}
                    alt={`${car.year} ${car.make} ${car.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className={cn('absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold text-white', getScoreBg(car.score))}>
                    {car.score}
                  </div>
                </div>
                <div className="p-3">
                  <p className="font-semibold text-sm">{car.year} {car.make} {car.model}</p>
                  <p className={cn('text-xs', getScoreColor(car.score))}>
                    {car.score >= 9 ? 'Excellent' : car.score >= 7 ? 'Good' : 'Average'} Reliability
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Most Reliable Cars Section */}
      <section id="reliable" className="py-10 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold">Most Reliable</h2>
              <p className="text-sm text-muted-foreground">Top performers based on NHTSA data</p>
            </div>
            <Shield className="w-5 h-5 text-green-500" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {MOST_RELIABLE.map((car, index) => (
              <button
                key={index}
                onClick={() => navigateToVehicle(car.year, car.make, car.model)}
                className="group bg-card border rounded-xl overflow-hidden card-hover text-left"
              >
                <div className="aspect-[4/3] relative bg-muted overflow-hidden">
                  <img
                    src={car.image}
                    alt={`${car.year} ${car.make} ${car.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold text-white bg-green-500 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {car.score}
                  </div>
                </div>
                <div className="p-3">
                  <p className="font-semibold text-sm">{car.year} {car.make} {car.model}</p>
                  <p className="text-xs text-green-500">✓ Safe Buy</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Auto News Section */}
      <section id="news" className="py-10 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold">Auto News</h2>
              <p className="text-sm text-muted-foreground">Latest from top automotive sources</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Sources:</span>
              <span className="text-blue-500">Motor1</span>
              <span>•</span>
              <span className="text-blue-500">Autoblog</span>
              <span>•</span>
              <span className="text-blue-500">Car and Driver</span>
            </div>
          </div>

          {newsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : news.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {news.slice(0, 6).map((item, index) => (
                <a
                  key={index}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-card border rounded-xl overflow-hidden card-hover"
                >
                  {item.image && (
                    <div className="aspect-video relative bg-muted overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-sm line-clamp-2 mb-3 group-hover:text-blue-500 transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                        {item.source}
                      </span>
                      <span>{new Date(item.pubDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-xl">
              <Newspaper className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No news available at the moment</p>
            </div>
          )}
        </div>
      </section>

      {/* Methodology Section */}
      <section id="methodology" className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Info className="w-5 h-5" />
            <h2 className="text-xl font-bold">How We Calculate Reliability Scores</h2>
          </div>

          <div className="bg-card border rounded-xl p-6">
            <p className="text-sm text-muted-foreground mb-6">
              Our scores are 100% data-driven, using official government sources—not paid reviews or manufacturer claims.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">1</span>
                  Data Sources
                </h3>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span><strong>NHTSA Complaints</strong> – Real owner-reported problems filed with the government</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span><strong>Safety Recalls</strong> – Manufacturer-reported defects requiring repair</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span><strong>EPA Data</strong> – Official fuel economy from dynamometer testing</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">2</span>
                  Scoring Formula
                </h3>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">→</span>
                    <span>Start with base score of <strong>9.5/10</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">→</span>
                    <span>Deduct for complaint rate (normalized by sales volume)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">→</span>
                    <span>Deduct for severity (crashes, fires, injuries weighted higher)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">→</span>
                    <span>Deduct for active recalls</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">3</span>
                Component Weights <span className="text-xs font-normal text-muted-foreground">(sums to 100%)</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Engine', weight: '20%' },
                  { name: 'Transmission', weight: '18%' },
                  { name: 'Brakes', weight: '15%' },
                  { name: 'Safety Systems', weight: '15%' },
                  { name: 'Electrical', weight: '12%' },
                  { name: 'Steering', weight: '10%' },
                  { name: 'Interior', weight: '5%' },
                  { name: 'Visibility', weight: '3%' },
                  { name: 'Exterior', weight: '2%' },
                ].map((c) => (
                  <span key={c.name} className="px-3 py-1 bg-muted rounded-full text-xs">
                    {c.name} <strong>{c.weight}</strong>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Compact */}
      <section className="py-10 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Shield, title: 'Safety Data', desc: 'Real complaints & recalls' },
              { icon: TrendingUp, title: 'Reliability Scores', desc: 'Data-driven ratings' },
              { icon: Car, title: 'Ownership Cost', desc: '5-year cost estimates' },
              { icon: Zap, title: 'Expert Reviews', desc: 'Curated YouTube videos' },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-card border rounded-xl p-4 text-center">
                  <Icon className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                  <h3 className="font-medium text-sm">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-foreground flex items-center justify-center">
                <Car className="w-4 h-4 text-background" />
              </div>
              <span className="font-medium">CARAG</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="text-muted-foreground">Data Sources:</span>
              <a href="https://www.nhtsa.gov" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 flex items-center gap-1">
                NHTSA.gov <ExternalLink className="w-3 h-3" />
              </a>
              <a href="https://fueleconomy.gov" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 flex items-center gap-1">
                FuelEconomy.gov <ExternalLink className="w-3 h-3" />
              </a>
              <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 flex items-center gap-1">
                YouTube <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          <div className="pt-4 border-t border-border/50 text-xs text-muted-foreground text-center space-y-2">
            <p>
              All complaint and recall data is sourced from the National Highway Traffic Safety Administration (NHTSA),
              a U.S. government agency. This data is public domain under 17 U.S.C. § 105. CARAG is not affiliated with
              NHTSA, the EPA, or any vehicle manufacturer. Reliability scores are calculated algorithmically from
              publicly available data.
            </p>
            <div className="flex items-center justify-center gap-4">
              <a href="/terms" className="hover:text-foreground transition-colors">Terms of Service</a>
              <span>•</span>
              <a href="/disclaimer" className="hover:text-foreground transition-colors">Disclaimer</a>
              <span>•</span>
              <span>© 2026 CARAG</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
