-- Create the bingo_cards table in the bingo schema
-- Run this SQL in your Neon SQL Editor

CREATE TABLE bingo.bingo_cards (
  id SERIAL PRIMARY KEY,
  code VARCHAR(6) UNIQUE NOT NULL,
  items JSONB NOT NULL,
  customization JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for fast lookups by code
CREATE INDEX idx_bingo_cards_code ON bingo.bingo_cards(code);

-- Optional: If you want to move bingo_pool_signups to the bingo schema for consistency
-- CREATE TABLE bingo.bingo_pool_signups (
--   id BIGSERIAL PRIMARY KEY,
--   name VARCHAR(255) NOT NULL,
--   phone_number VARCHAR(20) NOT NULL,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );
-- CREATE UNIQUE INDEX idx_phone_number ON bingo.bingo_pool_signups(phone_number);
-- CREATE INDEX idx_created_at ON bingo.bingo_pool_signups(created_at);

-- Create the analytics_events table for custom event tracking
CREATE TABLE bingo.analytics_events (
  id BIGSERIAL PRIMARY KEY,
  event_name VARCHAR(100) NOT NULL,
  event_data JSONB,
  user_agent TEXT,
  referrer TEXT,
  page_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX idx_analytics_events_name ON bingo.analytics_events(event_name);
CREATE INDEX idx_analytics_events_created_at ON bingo.analytics_events(created_at);

