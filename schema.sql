-- PostgreSQL Schema for The Food Tribunal (VERDICT)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
-- We will use a separate users table linked to Supabase auth OR we can rely solely on Supabase Auth (auth.users). 
-- But as requested, here is a public users table synchronized with auth.users or manually managed.
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRODUCTS TABLE
-- Stores the scraped or added food products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255),
  barcode VARCHAR(100) UNIQUE NOT NULL,
  ingredients TEXT NOT NULL,
  nutrition JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ANALYSIS TABLE
-- Stores the VERDICT calculation results for each product
CREATE TABLE analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  verdict VARCHAR(50) NOT NULL CHECK (verdict IN ('CLEAN', 'CAUTION', 'RISK')),
  risks JSONB DEFAULT '[]'::jsonb,
  additives JSONB DEFAULT '[]'::jsonb,
  ingredient_analysis JSONB DEFAULT '{}'::jsonb,
  processing_level VARCHAR(50) DEFAULT 'UNKNOWN',
  health_summary TEXT,
  analysis_source VARCHAR(50) DEFAULT 'openai' CHECK (analysis_source IN ('openai', 'fallback_rule_engine')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_product_analysis UNIQUE(product_id)
);

-- Note: If you already ran the first schema, run this to update your database:
-- ALTER TABLE analysis ADD COLUMN ingredient_analysis JSONB DEFAULT '{}'::jsonb;
-- ALTER TABLE analysis ADD COLUMN processing_level VARCHAR(50) DEFAULT 'UNKNOWN';
-- ALTER TABLE analysis ADD COLUMN health_summary TEXT;

-- AUTHORITY SYSTEM UPDATES --
-- ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'USER' CHECK (role IN ('USER', 'INSPECTOR', 'ADMIN'));
-- ALTER TABLE products ADD COLUMN verdict_certified BOOLEAN DEFAULT false;

-- 5. CERTIFICATIONS TABLE
CREATE TABLE certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  brand_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ASSIGNED', 'INSPECTED', 'APPROVED', 'REJECTED')),
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  inspector_id UUID REFERENCES users(id) ON DELETE SET NULL,
  admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  inspector_notes TEXT,
  certificate_id VARCHAR(50) UNIQUE -- Official Trust Code
);

CREATE INDEX idx_certifications_status ON certifications(status);
CREATE INDEX idx_certifications_product_id ON certifications(product_id);

-- PUBLIC EXPOSURE UPDATES --

-- 6. PRODUCT REVIEWS TABLE
CREATE TABLE product_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  moderation_status VARCHAR(20) DEFAULT 'VISIBLE' CHECK (moderation_status IN ('VISIBLE', 'HIDDEN', 'FLAGGED')),
  CONSTRAINT unique_user_product_review UNIQUE(user_id, product_id)
);

-- 7. PRODUCT REPORTS TABLE
CREATE TABLE product_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('MISLEADING_LABEL', 'HIDDEN_SUGAR', 'INGREDIENT_DOUBT', 'CHILD_UNSAFE', 'OTHER')),
  description TEXT,
  status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_flagged BOOLEAN DEFAULT false
);

-- 8. PRODUCT DISCUSSIONS TABLE
CREATE TABLE product_discussions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  moderation_status VARCHAR(20) DEFAULT 'VISIBLE' CHECK (moderation_status IN ('VISIBLE', 'HIDDEN', 'FLAGGED'))
);

-- 9. PRODUCT DISCUSSION REPLIES TABLE
CREATE TABLE product_discussion_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  discussion_id UUID NOT NULL REFERENCES product_discussions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  moderation_status VARCHAR(20) DEFAULT 'VISIBLE' CHECK (moderation_status IN ('VISIBLE', 'HIDDEN', 'FLAGGED'))
);

-- 10. TRANSPARENCY REPORTS TABLE (CMS)
CREATE TABLE transparency_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- 11. AUDIT LOGS TABLE
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_role VARCHAR(20),
  action_type VARCHAR(50) NOT NULL,
  target_type VARCHAR(50),
  target_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_action ON audit_logs(action_type);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_user_id);
CREATE INDEX idx_audit_logs_target ON audit_logs(target_id);

-- 4. SCAN_HISTORY TABLE
-- Tracks which user scanned which product and when
CREATE TABLE scan_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  scanned_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. TRENDING SNAPSHOTS TABLE
CREATE TABLE trending_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trend_type VARCHAR(50) NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance & audit forensics
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_analysis_product_id ON analysis(product_id);
CREATE INDEX idx_certifications_prod_status ON certifications(product_id, status);
CREATE INDEX idx_product_reports_lookup ON product_reports(product_id, status, created_at);
CREATE INDEX idx_product_reviews_lookup ON product_reviews(product_id, created_at);
CREATE INDEX idx_product_discussions_lookup ON product_discussions(product_id, created_at);
CREATE INDEX idx_trending_lookup ON trending_snapshots(trend_type, created_at);
CREATE INDEX idx_audit_logs_actor_time ON audit_logs(actor_user_id, created_at);
CREATE INDEX idx_audit_logs_target_time ON audit_logs(target_id, created_at);
CREATE INDEX idx_scan_history_user_id ON scan_history(user_id);
CREATE INDEX idx_scan_history_product_id ON scan_history(product_id);
