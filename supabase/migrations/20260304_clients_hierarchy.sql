-- ============================================================
-- Migration: Client > Brand Kit > Campaign > Framework hierarchy
-- Creates clients table, links brand_kits/campaigns/frameworks
-- Safe to re-run (idempotent)
-- ============================================================

-- ============================================================
-- 1. CLIENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  industry text,
  website text,
  logo_url text,
  notes text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can manage clients" ON clients;
CREATE POLICY "Org members can manage clients" ON clients FOR ALL
  USING (is_org_member(org_id) OR is_super_admin())
  WITH CHECK (is_org_member(org_id) OR is_super_admin());

CREATE INDEX IF NOT EXISTS idx_clients_org ON clients(org_id);

DROP TRIGGER IF EXISTS set_updated_at ON clients;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 2. ADD client_id TO brand_kits
-- ============================================================
ALTER TABLE brand_kits ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES clients(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_brand_kits_client ON brand_kits(client_id);

-- ============================================================
-- 3. ADD client_id TO campaigns
-- ============================================================
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES clients(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_campaigns_client ON campaigns(client_id);

-- ============================================================
-- 4. ADD campaign_id + org_id TO messaging_frameworks
-- ============================================================
ALTER TABLE messaging_frameworks
  ADD COLUMN IF NOT EXISTS campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_frameworks_campaign ON messaging_frameworks(campaign_id);
CREATE INDEX IF NOT EXISTS idx_frameworks_org ON messaging_frameworks(org_id);

-- Update RLS: user-scoped OR org-scoped
DROP POLICY IF EXISTS "Users can view own frameworks" ON messaging_frameworks;
DROP POLICY IF EXISTS "Users can create own frameworks" ON messaging_frameworks;
DROP POLICY IF EXISTS "Users can update own frameworks" ON messaging_frameworks;
DROP POLICY IF EXISTS "Users can delete own frameworks" ON messaging_frameworks;

CREATE POLICY "View frameworks" ON messaging_frameworks FOR SELECT
  USING (auth.uid() = user_id OR (org_id IS NOT NULL AND (is_org_member(org_id) OR is_super_admin())));
CREATE POLICY "Create frameworks" ON messaging_frameworks FOR INSERT
  WITH CHECK (auth.uid() = user_id OR (org_id IS NOT NULL AND (is_org_member(org_id) OR is_super_admin())));
CREATE POLICY "Update frameworks" ON messaging_frameworks FOR UPDATE
  USING (auth.uid() = user_id OR (org_id IS NOT NULL AND (is_org_member(org_id) OR is_super_admin())));
CREATE POLICY "Delete frameworks" ON messaging_frameworks FOR DELETE
  USING (auth.uid() = user_id OR (org_id IS NOT NULL AND (is_org_member(org_id) OR is_super_admin())));

-- ============================================================
-- 5. DATA MIGRATION: Create default clients from existing data
-- ============================================================
-- For each org that has campaigns, create a default client
-- using brand_name from the first campaign's brief
INSERT INTO clients (org_id, name, industry, website, status)
SELECT DISTINCT ON (c.org_id)
  c.org_id,
  COALESCE(c.brief->>'brand_name', 'Default Client'),
  c.brief->>'industry',
  c.brief->>'website',
  'active'
FROM campaigns c
WHERE c.client_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM clients cl WHERE cl.org_id = c.org_id)
ORDER BY c.org_id, c.created_at ASC
ON CONFLICT DO NOTHING;

-- Link existing brand_kits to the default client for their org
UPDATE brand_kits bk
SET client_id = cl.id
FROM clients cl
WHERE bk.org_id = cl.org_id
  AND bk.client_id IS NULL;

-- Link existing campaigns to the default client for their org
UPDATE campaigns c
SET client_id = cl.id
FROM clients cl
WHERE c.org_id = cl.org_id
  AND c.client_id IS NULL;

-- Set org_id on messaging_frameworks from user's org membership
UPDATE messaging_frameworks mf
SET org_id = om.org_id
FROM org_members om
WHERE mf.user_id = om.user_id
  AND mf.org_id IS NULL;
