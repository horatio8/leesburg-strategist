-- ============================================================
-- Migration: Campaign-centric restructure
-- Brand kits belong to campaigns (not clients).
-- Campaigns have MANY brand kits (not one).
-- Creatives track which brand kit + framework generated them.
-- ============================================================

-- 1. Add campaign_id to brand_kits
ALTER TABLE brand_kits
  ADD COLUMN IF NOT EXISTS campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_brand_kits_campaign ON brand_kits(campaign_id);

-- 2. Remove brand_kit_id from campaigns (one-to-many inversion)
ALTER TABLE campaigns DROP COLUMN IF EXISTS brand_kit_id;

-- 3. Add lineage columns to creatives
ALTER TABLE creatives
  ADD COLUMN IF NOT EXISTS brand_kit_id uuid REFERENCES brand_kits(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS framework_id uuid REFERENCES messaging_frameworks(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_creatives_brand_kit ON creatives(brand_kit_id);
CREATE INDEX IF NOT EXISTS idx_creatives_framework ON creatives(framework_id);

-- 4. Data migration: link existing brand kits to their most recent campaign via shared client_id
UPDATE brand_kits bk SET campaign_id = (
  SELECT c.id FROM campaigns c
  WHERE c.client_id = bk.client_id
  ORDER BY c.updated_at DESC LIMIT 1
) WHERE bk.campaign_id IS NULL AND bk.client_id IS NOT NULL;
