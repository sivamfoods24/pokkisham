-- ==========================================
-- POKKISHAM E-COMMERCE SUPABASE DATABASE SCHEMA
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ==========================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    badge TEXT DEFAULT 'New Arrival',
    rating NUMERIC DEFAULT 5,
    reviews_count INT DEFAULT 1,
    price NUMERIC NOT NULL,
    old_price NUMERIC,
    unit TEXT NOT NULL,
    variants JSONB NOT NULL DEFAULT '[]'::jsonb,
    variant_prices JSONB NOT NULL DEFAULT '{}'::jsonb,
    image TEXT NOT NULL,
    description TEXT,
    in_stock BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    badge TEXT DEFAULT '6+ Products',
    icon TEXT DEFAULT '🌿',
    image TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    items TEXT NOT NULL,
    items_json JSONB DEFAULT '[]'::jsonb,
    payment_method TEXT NOT NULL,
    transaction_id TEXT,
    total NUMERIC NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'Processing',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TESTIMONIALS TABLE
CREATE TABLE IF NOT EXISTS public.testimonials (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT DEFAULT 'Tamil Nadu',
    rating INT DEFAULT 5,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. STORE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.store_settings (
    id INT PRIMARY KEY DEFAULT 1,
    phone TEXT NOT NULL DEFAULT '+91 90474 77499',
    email TEXT NOT NULL DEFAULT 'pokkishamstore@gmail.com',
    whatsapp TEXT NOT NULL DEFAULT 'https://wa.me/919047477499',
    address TEXT NOT NULL DEFAULT 'Trichy, Tamil Nadu, India',
    free_shipping_threshold NUMERIC DEFAULT 999,
    payment_settings JSONB DEFAULT '{
      "upiId": "9047477499@ybl",
      "upiName": "Pokkisham Store",
      "qrCodeImage": "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=upi://pay?pa=9047477499@ybl&pn=Pokkisham%20Store",
      "bankName": "State Bank of India",
      "accNo": "39485720194",
      "ifsc": "SBIN0004819"
    }'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ & WRITE POLICIES FOR LIVE INTEGRATION
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public Write Products" ON public.products FOR ALL USING (true);

CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public Write Categories" ON public.categories FOR ALL USING (true);

CREATE POLICY "Public Read Orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Public Write Orders" ON public.orders FOR ALL USING (true);

CREATE POLICY "Public Read Testimonials" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "Public Write Testimonials" ON public.testimonials FOR ALL USING (true);

CREATE POLICY "Public Read Store Settings" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Public Write Store Settings" ON public.store_settings FOR ALL USING (true);

-- Enable Realtime Replication
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.store_settings;
