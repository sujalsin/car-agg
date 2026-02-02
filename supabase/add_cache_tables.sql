-- CARAG Cache Tables Migration
-- Run this to add caching functionality to an existing CARAG database
-- This file only contains NEW tables that don't exist yet

-- News cache table - store fetched news to reduce API calls
CREATE TABLE IF NOT EXISTS news_cache (
  id TEXT PRIMARY KEY DEFAULT 'latest',
  articles JSONB NOT NULL,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 minutes'
);

ALTER TABLE news_cache ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON news_cache;
DROP POLICY IF EXISTS "Enable insert for service role" ON news_cache;
DROP POLICY IF EXISTS "Enable update for service role" ON news_cache;
CREATE POLICY "Enable read access for all users" ON news_cache FOR SELECT USING (true);
CREATE POLICY "Enable insert for service role" ON news_cache FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for service role" ON news_cache FOR UPDATE USING (true);

-- Full vehicle data cache - stores complete API responses
CREATE TABLE IF NOT EXISTS vehicle_data_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  data JSONB NOT NULL,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '24 hours',
  UNIQUE(year, make, model)
);

CREATE INDEX IF NOT EXISTS idx_vehicle_data_cache ON vehicle_data_cache(year, make, model);
ALTER TABLE vehicle_data_cache ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON vehicle_data_cache;
DROP POLICY IF EXISTS "Enable insert for service role" ON vehicle_data_cache;
DROP POLICY IF EXISTS "Enable update for service role" ON vehicle_data_cache;
CREATE POLICY "Enable read access for all users" ON vehicle_data_cache FOR SELECT USING (true);
CREATE POLICY "Enable insert for service role" ON vehicle_data_cache FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for service role" ON vehicle_data_cache FOR UPDATE USING (true);

-- YouTube videos cache
CREATE TABLE IF NOT EXISTS youtube_cache (
  vehicle_key TEXT PRIMARY KEY,
  videos JSONB NOT NULL,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days'
);

ALTER TABLE youtube_cache ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON youtube_cache;
DROP POLICY IF EXISTS "Enable insert for service role" ON youtube_cache;
DROP POLICY IF EXISTS "Enable update for service role" ON youtube_cache;
CREATE POLICY "Enable read access for all users" ON youtube_cache FOR SELECT USING (true);
CREATE POLICY "Enable insert for service role" ON youtube_cache FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for service role" ON youtube_cache FOR UPDATE USING (true);

-- Fuel prices cache by zipcode
CREATE TABLE IF NOT EXISTS fuel_prices_cache (
  zipcode TEXT PRIMARY KEY,
  state TEXT NOT NULL,
  region TEXT NOT NULL,
  regular NUMERIC(4,2) NOT NULL,
  premium NUMERIC(4,2) NOT NULL,
  diesel NUMERIC(4,2) NOT NULL,
  electric NUMERIC(4,2) NOT NULL,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '6 hours'
);

ALTER TABLE fuel_prices_cache ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON fuel_prices_cache;
DROP POLICY IF EXISTS "Enable insert for service role" ON fuel_prices_cache;
DROP POLICY IF EXISTS "Enable update for service role" ON fuel_prices_cache;
CREATE POLICY "Enable read access for all users" ON fuel_prices_cache FOR SELECT USING (true);
CREATE POLICY "Enable insert for service role" ON fuel_prices_cache FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for service role" ON fuel_prices_cache FOR UPDATE USING (true);

-- Complaints cache
CREATE TABLE IF NOT EXISTS complaints_cache (
  vehicle_key TEXT PRIMARY KEY,
  complaints JSONB NOT NULL,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '48 hours'
);

ALTER TABLE complaints_cache ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON complaints_cache;
DROP POLICY IF EXISTS "Enable insert for service role" ON complaints_cache;
DROP POLICY IF EXISTS "Enable update for service role" ON complaints_cache;
CREATE POLICY "Enable read access for all users" ON complaints_cache FOR SELECT USING (true);
CREATE POLICY "Enable insert for service role" ON complaints_cache FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for service role" ON complaints_cache FOR UPDATE USING (true);

-- Recalls cache
CREATE TABLE IF NOT EXISTS recalls_cache (
  vehicle_key TEXT PRIMARY KEY,
  recalls JSONB NOT NULL,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '48 hours'
);

ALTER TABLE recalls_cache ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON recalls_cache;
DROP POLICY IF EXISTS "Enable insert for service role" ON recalls_cache;
DROP POLICY IF EXISTS "Enable update for service role" ON recalls_cache;
CREATE POLICY "Enable read access for all users" ON recalls_cache FOR SELECT USING (true);
CREATE POLICY "Enable insert for service role" ON recalls_cache FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for service role" ON recalls_cache FOR UPDATE USING (true);

-- Vehicle specs cache table
CREATE TABLE IF NOT EXISTS vehicle_specs_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  specs JSONB NOT NULL,
  variants JSONB,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days',
  UNIQUE(year, make, model)
);

CREATE INDEX IF NOT EXISTS idx_specs_cache_vehicle ON vehicle_specs_cache(year, make, model);
ALTER TABLE vehicle_specs_cache ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON vehicle_specs_cache;
DROP POLICY IF EXISTS "Enable insert for service role" ON vehicle_specs_cache;
DROP POLICY IF EXISTS "Enable update for service role" ON vehicle_specs_cache;
CREATE POLICY "Enable read access for all users" ON vehicle_specs_cache FOR SELECT USING (true);
CREATE POLICY "Enable insert for service role" ON vehicle_specs_cache FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for service role" ON vehicle_specs_cache FOR UPDATE USING (true);
