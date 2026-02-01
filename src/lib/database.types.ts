export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            vehicles: {
                Row: {
                    id: string;
                    year: number;
                    make: string;
                    model: string;
                    trim: string | null;
                    body_type: string | null;
                    engine: string | null;
                    transmission: string | null;
                    drivetrain: string | null;
                    fuel_type: string | null;
                    msrp: number | null;
                    image_url: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    year: number;
                    make: string;
                    model: string;
                    trim?: string | null;
                    body_type?: string | null;
                    engine?: string | null;
                    transmission?: string | null;
                    drivetrain?: string | null;
                    fuel_type?: string | null;
                    msrp?: number | null;
                    image_url?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    year?: number;
                    make?: string;
                    model?: string;
                    trim?: string | null;
                    body_type?: string | null;
                    engine?: string | null;
                    transmission?: string | null;
                    drivetrain?: string | null;
                    fuel_type?: string | null;
                    msrp?: number | null;
                    image_url?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            complaints: {
                Row: {
                    id: string;
                    vehicle_id: string;
                    nhtsa_id: string;
                    date_received: string;
                    component: string;
                    summary: string;
                    crash: boolean;
                    fire: boolean;
                    injuries: number;
                    deaths: number;
                    mileage: number | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    vehicle_id: string;
                    nhtsa_id: string;
                    date_received: string;
                    component: string;
                    summary: string;
                    crash?: boolean;
                    fire?: boolean;
                    injuries?: number;
                    deaths?: number;
                    mileage?: number | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    vehicle_id?: string;
                    nhtsa_id?: string;
                    date_received?: string;
                    component?: string;
                    summary?: string;
                    crash?: boolean;
                    fire?: boolean;
                    injuries?: number;
                    deaths?: number;
                    mileage?: number | null;
                    created_at?: string;
                };
            };
            recalls: {
                Row: {
                    id: string;
                    vehicle_id: string;
                    nhtsa_campaign_number: string;
                    report_received_date: string;
                    component: string;
                    summary: string;
                    consequence: string;
                    remedy: string;
                    notes: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    vehicle_id: string;
                    nhtsa_campaign_number: string;
                    report_received_date: string;
                    component: string;
                    summary: string;
                    consequence: string;
                    remedy: string;
                    notes?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    vehicle_id?: string;
                    nhtsa_campaign_number?: string;
                    report_received_date?: string;
                    component?: string;
                    summary?: string;
                    consequence?: string;
                    remedy?: string;
                    notes?: string | null;
                    created_at?: string;
                };
            };
            fuel_economy: {
                Row: {
                    id: string;
                    vehicle_id: string;
                    epa_vehicle_id: string;
                    city_mpg: number;
                    highway_mpg: number;
                    combined_mpg: number;
                    real_world_mpg: number | null;
                    real_world_sample_size: number | null;
                    annual_fuel_cost: number | null;
                    co2_emissions: number | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    vehicle_id: string;
                    epa_vehicle_id: string;
                    city_mpg: number;
                    highway_mpg: number;
                    combined_mpg: number;
                    real_world_mpg?: number | null;
                    real_world_sample_size?: number | null;
                    annual_fuel_cost?: number | null;
                    co2_emissions?: number | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    vehicle_id?: string;
                    epa_vehicle_id?: string;
                    city_mpg?: number;
                    highway_mpg?: number;
                    combined_mpg?: number;
                    real_world_mpg?: number | null;
                    real_world_sample_size?: number | null;
                    annual_fuel_cost?: number | null;
                    co2_emissions?: number | null;
                    created_at?: string;
                };
            };
            reliability_scores: {
                Row: {
                    id: string;
                    vehicle_id: string;
                    overall_score: number;
                    engine_score: number;
                    transmission_score: number;
                    electrical_score: number;
                    safety_score: number;
                    interior_score: number;
                    exterior_score: number;
                    complaint_count: number;
                    recall_count: number;
                    calculated_at: string;
                };
                Insert: {
                    id?: string;
                    vehicle_id: string;
                    overall_score: number;
                    engine_score: number;
                    transmission_score: number;
                    electrical_score: number;
                    safety_score: number;
                    interior_score: number;
                    exterior_score: number;
                    complaint_count?: number;
                    recall_count?: number;
                    calculated_at?: string;
                };
                Update: {
                    id?: string;
                    vehicle_id?: string;
                    overall_score?: number;
                    engine_score?: number;
                    transmission_score?: number;
                    electrical_score?: number;
                    safety_score?: number;
                    interior_score?: number;
                    exterior_score?: number;
                    complaint_count?: number;
                    recall_count?: number;
                    calculated_at?: string;
                };
            };
            youtube_reviews: {
                Row: {
                    id: string;
                    vehicle_id: string;
                    youtube_video_id: string;
                    title: string;
                    channel_name: string;
                    channel_id: string;
                    thumbnail_url: string;
                    view_count: number | null;
                    like_count: number | null;
                    published_at: string;
                    duration: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    vehicle_id: string;
                    youtube_video_id: string;
                    title: string;
                    channel_name: string;
                    channel_id: string;
                    thumbnail_url: string;
                    view_count?: number | null;
                    like_count?: number | null;
                    published_at: string;
                    duration?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    vehicle_id?: string;
                    youtube_video_id?: string;
                    title?: string;
                    channel_name?: string;
                    channel_id?: string;
                    thumbnail_url?: string;
                    view_count?: number | null;
                    like_count?: number | null;
                    published_at?: string;
                    duration?: string | null;
                    created_at?: string;
                };
            };
            forum_discussions: {
                Row: {
                    id: string;
                    vehicle_id: string;
                    source: string;
                    post_id: string;
                    title: string;
                    url: string;
                    author: string;
                    score: number | null;
                    comment_count: number | null;
                    sentiment: string | null;
                    topics: string[] | null;
                    created_at: string;
                    fetched_at: string;
                };
                Insert: {
                    id?: string;
                    vehicle_id: string;
                    source: string;
                    post_id: string;
                    title: string;
                    url: string;
                    author: string;
                    score?: number | null;
                    comment_count?: number | null;
                    sentiment?: string | null;
                    topics?: string[] | null;
                    created_at: string;
                    fetched_at?: string;
                };
                Update: {
                    id?: string;
                    vehicle_id?: string;
                    source?: string;
                    post_id?: string;
                    title?: string;
                    url?: string;
                    author?: string;
                    score?: number | null;
                    comment_count?: number | null;
                    sentiment?: string | null;
                    topics?: string[] | null;
                    created_at?: string;
                    fetched_at?: string;
                };
            };
        };
        Views: {};
        Functions: {};
        Enums: {};
    };
}
