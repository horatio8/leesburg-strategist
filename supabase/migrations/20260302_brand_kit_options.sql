-- Phase 5: Brand Kit Extraction & Generation System
-- Run this migration via the Supabase Dashboard SQL Editor

-- 1. Create brand_kit_options table for storing generated/extracted options
CREATE TABLE brand_kit_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_kit_id uuid REFERENCES brand_kits(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('extraction','generation')),
  category text NOT NULL CHECK (category IN ('logo','palette','font_pairing','voice','style_direction','full_extraction')),
  data jsonb NOT NULL DEFAULT '{}',
  selected boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Add source column to brand_kits
ALTER TABLE brand_kits ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual' CHECK (source IN ('manual','extracted','generated'));

-- 3. RLS for brand_kit_options (same org-scoped pattern)
ALTER TABLE brand_kit_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view brand kit options"
  ON brand_kit_options FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM brand_kits bk
      WHERE bk.id = brand_kit_options.brand_kit_id
      AND (is_org_member(bk.org_id) OR is_super_admin())
    )
  );

CREATE POLICY "Org members can create brand kit options"
  ON brand_kit_options FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM brand_kits bk
      WHERE bk.id = brand_kit_options.brand_kit_id
      AND (is_org_member(bk.org_id) OR is_super_admin())
    )
  );

CREATE POLICY "Org members can update brand kit options"
  ON brand_kit_options FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM brand_kits bk
      WHERE bk.id = brand_kit_options.brand_kit_id
      AND (is_org_member(bk.org_id) OR is_super_admin())
    )
  );

CREATE POLICY "Org members can delete brand kit options"
  ON brand_kit_options FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM brand_kits bk
      WHERE bk.id = brand_kit_options.brand_kit_id
      AND (is_org_member(bk.org_id) OR is_super_admin())
    )
  );

-- 4. Index for efficient lookups
CREATE INDEX idx_brand_kit_options_brand_kit_id ON brand_kit_options(brand_kit_id);
CREATE INDEX idx_brand_kit_options_type ON brand_kit_options(type);
