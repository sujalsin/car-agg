-- CARAG Database Schema
-- Run this in Supabase SQL Editor to create the tables

-- Vehicles table - core vehicle information
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  trim TEXT,
  body_type TEXT,
  engine TEXT,
  transmission TEXT,
  drivetrain TEXT,
  fuel_type TEXT,
  msrp INTEGER,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(year, make, model, trim)
);

-- Complaints table - NHTSA safety complaints
CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  nhtsa_id TEXT UNIQUE NOT NULL,
  date_received DATE NOT NULL,
  component TEXT NOT NULL,
  summary TEXT NOT NULL,
  crash BOOLEAN DEFAULT FALSE,
  fire BOOLEAN DEFAULT FALSE,
  injuries INTEGER DEFAULT 0,
  deaths INTEGER DEFAULT 0,
  mileage INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recalls table - NHTSA recall campaigns
CREATE TABLE IF NOT EXISTS recalls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  nhtsa_campaign_number TEXT UNIQUE NOT NULL,
  report_received_date DATE NOT NULL,
  component TEXT NOT NULL,
  summary TEXT NOT NULL,
  consequence TEXT NOT NULL,
  remedy TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fuel economy table - EPA data
CREATE TABLE IF NOT EXISTS fuel_economy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  epa_vehicle_id TEXT NOT NULL,
  city_mpg INTEGER NOT NULL,
  highway_mpg INTEGER NOT NULL,
  combined_mpg INTEGER NOT NULL,
  real_world_mpg NUMERIC(4, 1),
  real_world_sample_size INTEGER,
  annual_fuel_cost INTEGER,
  co2_emissions INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(vehicle_id, epa_vehicle_id)
);

-- Reliability scores table - calculated metrics
CREATE TABLE IF NOT EXISTS reliability_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE UNIQUE,
  overall_score NUMERIC(3, 1) NOT NULL,
  engine_score NUMERIC(3, 1) NOT NULL,
  transmission_score NUMERIC(3, 1) NOT NULL,
  electrical_score NUMERIC(3, 1) NOT NULL,
  safety_score NUMERIC(3, 1) NOT NULL,
  interior_score NUMERIC(3, 1) NOT NULL,
  exterior_score NUMERIC(3, 1) NOT NULL,
  complaint_count INTEGER DEFAULT 0,
  recall_count INTEGER DEFAULT 0,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- YouTube reviews table
CREATE TABLE IF NOT EXISTS youtube_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  youtube_video_id TEXT NOT NULL,
  title TEXT NOT NULL,
  channel_name TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  view_count BIGINT,
  like_count BIGINT,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(vehicle_id, youtube_video_id)
);

-- Forum discussions table - Reddit and other forums
CREATE TABLE IF NOT EXISTS forum_discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  source TEXT NOT NULL, -- 'reddit', 'forum', etc.
  post_id TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  author TEXT NOT NULL,
  score INTEGER,
  comment_count INTEGER,
  sentiment TEXT, -- 'positive', 'negative', 'neutral'
  topics TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(source, post_id)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_vehicles_make_model ON vehicles(make, model);
CREATE INDEX IF NOT EXISTS idx_vehicles_year ON vehicles(year);
CREATE INDEX IF NOT EXISTS idx_complaints_vehicle_id ON complaints(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_complaints_component ON complaints(component);
CREATE INDEX IF NOT EXISTS idx_recalls_vehicle_id ON recalls(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_fuel_economy_vehicle_id ON fuel_economy(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_youtube_reviews_vehicle_id ON youtube_reviews(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_forum_discussions_vehicle_id ON forum_discussions(vehicle_id);

-- Enable Row Level Security
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE recalls ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_economy ENABLE ROW LEVEL SECURITY;
ALTER TABLE reliability_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_discussions ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Enable read access for all users" ON vehicles FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON complaints FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON recalls FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON fuel_economy FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON reliability_scores FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON youtube_reviews FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON forum_discussions FOR SELECT USING (true);

-- Create policies for service role write access
CREATE POLICY "Enable insert for service role" ON vehicles FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for service role" ON vehicles FOR UPDATE USING (true);
CREATE POLICY "Enable insert for service role" ON complaints FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for service role" ON recalls FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for service role" ON fuel_economy FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for service role" ON reliability_scores FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for service role" ON reliability_scores FOR UPDATE USING (true);
CREATE POLICY "Enable insert for service role" ON youtube_reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for service role" ON forum_discussions FOR INSERT WITH CHECK (true);
