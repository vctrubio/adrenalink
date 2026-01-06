-- ============================================================================
-- School Domain Tables
-- Manages school accounts, packages, and subscriptions
-- ============================================================================

CREATE TABLE school (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    country VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    status TEXT NOT NULL DEFAULT 'beta',
    currency TEXT NOT NULL DEFAULT 'EUR',
    latitude NUMERIC(12, 8),
    longitude NUMERIC(12, 8),
    timezone VARCHAR(50),
    google_place_id VARCHAR(255),
    equipment_categories TEXT,
    website_url VARCHAR(255),
    instagram_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE school_package (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    duration_minutes INTEGER NOT NULL,
    description TEXT NOT NULL,
    price_per_student INTEGER NOT NULL,
    capacity_students INTEGER NOT NULL DEFAULT 1,
    capacity_equipment INTEGER NOT NULL DEFAULT 1,
    category_equipment TEXT NOT NULL,
    package_type TEXT NOT NULL,
    school_id UUID REFERENCES school(id),
    is_public BOOLEAN NOT NULL DEFAULT true,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX school_package_school_id_idx ON school_package(school_id);

CREATE TABLE school_subscription (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES school(id),
    tier TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX school_subscription_school_id_idx ON school_subscription(school_id);
CREATE TABLE referral (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) NOT NULL,
    school_id UUID NOT NULL REFERENCES school(id),
    commission_type TEXT NOT NULL,
    commission_value VARCHAR(100) NOT NULL,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX referral_school_id_idx ON referral(school_id);
CREATE INDEX referral_code_idx ON referral(code);