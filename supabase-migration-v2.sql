-- ============================================================
-- AI Marketing Agency Platform - Migration v2
-- Multi-tenancy, campaigns, agents, approvals
-- Safe to re-run (idempotent)
-- Run in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  is_super_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create profiles for existing users
INSERT INTO profiles (id, display_name)
SELECT id, raw_user_meta_data->>'full_name'
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. ORGANIZATIONS (tables before functions that reference them)
-- ============================================================
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  logo_url text,
  industry text,
  website text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. ORG MEMBERS (must exist before is_org_member function)
-- ============================================================
CREATE TABLE IF NOT EXISTS org_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner','admin','member','viewer')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(org_id, user_id)
);

-- ============================================================
-- 4. RLS HELPER FUNCTIONS (now that tables exist)
-- ============================================================
CREATE OR REPLACE FUNCTION is_org_member(org uuid) RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM org_members WHERE org_id = org AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_super_admin() RETURNS boolean AS $$
  SELECT COALESCE(
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()),
    false
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_user_orgs() RETURNS SETOF uuid AS $$
  SELECT org_id FROM org_members WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- 4a. RLS for organizations
-- ============================================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can view their orgs" ON organizations;
CREATE POLICY "Org members can view their orgs"
  ON organizations FOR SELECT USING (is_org_member(id) OR is_super_admin());

DROP POLICY IF EXISTS "Anyone can create an org" ON organizations;
CREATE POLICY "Anyone can create an org"
  ON organizations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Org members can update their orgs" ON organizations;
CREATE POLICY "Org members can update their orgs"
  ON organizations FOR UPDATE USING (is_org_member(id) OR is_super_admin());

DROP POLICY IF EXISTS "Super admins can delete orgs" ON organizations;
CREATE POLICY "Super admins can delete orgs"
  ON organizations FOR DELETE USING (is_super_admin());

-- ============================================================
-- 4b. RLS for org_members
-- ============================================================
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can view membership" ON org_members;
CREATE POLICY "Org members can view membership"
  ON org_members FOR SELECT USING (is_org_member(org_id) OR is_super_admin());

DROP POLICY IF EXISTS "Org members can add members" ON org_members;
CREATE POLICY "Org members can add members"
  ON org_members FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Org admins can update members" ON org_members;
CREATE POLICY "Org admins can update members"
  ON org_members FOR UPDATE USING (is_org_member(org_id) OR is_super_admin());

DROP POLICY IF EXISTS "Org admins can remove members" ON org_members;
CREATE POLICY "Org admins can remove members"
  ON org_members FOR DELETE USING (is_org_member(org_id) OR is_super_admin());

-- ============================================================
-- 5. BRAND KITS
-- ============================================================
CREATE TABLE IF NOT EXISTS brand_kits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL DEFAULT 'Default',
  colors jsonb NOT NULL DEFAULT '{}',
  fonts jsonb NOT NULL DEFAULT '{}',
  voice_guide text,
  logo_urls jsonb NOT NULL DEFAULT '[]',
  canva_brand_kit_id text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE brand_kits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can view brand kits" ON brand_kits;
CREATE POLICY "Org members can view brand kits"
  ON brand_kits FOR SELECT USING (is_org_member(org_id) OR is_super_admin());

DROP POLICY IF EXISTS "Org members can create brand kits" ON brand_kits;
CREATE POLICY "Org members can create brand kits"
  ON brand_kits FOR INSERT WITH CHECK (is_org_member(org_id) OR is_super_admin());

DROP POLICY IF EXISTS "Org members can update brand kits" ON brand_kits;
CREATE POLICY "Org members can update brand kits"
  ON brand_kits FOR UPDATE USING (is_org_member(org_id) OR is_super_admin());

DROP POLICY IF EXISTS "Org members can delete brand kits" ON brand_kits;
CREATE POLICY "Org members can delete brand kits"
  ON brand_kits FOR DELETE USING (is_org_member(org_id) OR is_super_admin());

-- ============================================================
-- 6. CAMPAIGNS
-- ============================================================
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  brand_kit_id uuid REFERENCES brand_kits(id) ON DELETE SET NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','researching','ideation','creating','review','deployed','monitoring','paused','complete')),
  phase integer NOT NULL DEFAULT 0,
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('high','normal','low')),
  brief jsonb NOT NULL DEFAULT '{}',
  budget_total numeric DEFAULT 0,
  budget_spent numeric DEFAULT 0,
  platforms text[] DEFAULT '{}',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can view campaigns" ON campaigns;
CREATE POLICY "Org members can view campaigns"
  ON campaigns FOR SELECT USING (is_org_member(org_id) OR is_super_admin());

DROP POLICY IF EXISTS "Org members can create campaigns" ON campaigns;
CREATE POLICY "Org members can create campaigns"
  ON campaigns FOR INSERT WITH CHECK (is_org_member(org_id) OR is_super_admin());

DROP POLICY IF EXISTS "Org members can update campaigns" ON campaigns;
CREATE POLICY "Org members can update campaigns"
  ON campaigns FOR UPDATE USING (is_org_member(org_id) OR is_super_admin());

DROP POLICY IF EXISTS "Org members can delete campaigns" ON campaigns;
CREATE POLICY "Org members can delete campaigns"
  ON campaigns FOR DELETE USING (is_org_member(org_id) OR is_super_admin());

-- ============================================================
-- 7. CAMPAIGN RESEARCH
-- ============================================================
CREATE TABLE IF NOT EXISTS campaign_research (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('competitor','social_audit','ad_library','seo','sentiment','brand_extraction')),
  competitor_name text,
  data jsonb NOT NULL DEFAULT '{}',
  confidence text DEFAULT 'medium' CHECK (confidence IN ('high','medium','low')),
  sources jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE campaign_research ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can view campaign research" ON campaign_research;
CREATE POLICY "Org members can view campaign research"
  ON campaign_research FOR SELECT USING (EXISTS (
    SELECT 1 FROM campaigns c WHERE c.id = campaign_id AND (is_org_member(c.org_id) OR is_super_admin())
  ));

DROP POLICY IF EXISTS "Org members can create campaign research" ON campaign_research;
CREATE POLICY "Org members can create campaign research"
  ON campaign_research FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM campaigns c WHERE c.id = campaign_id AND (is_org_member(c.org_id) OR is_super_admin())
  ));

DROP POLICY IF EXISTS "Org members can update campaign research" ON campaign_research;
CREATE POLICY "Org members can update campaign research"
  ON campaign_research FOR UPDATE USING (EXISTS (
    SELECT 1 FROM campaigns c WHERE c.id = campaign_id AND (is_org_member(c.org_id) OR is_super_admin())
  ));

DROP POLICY IF EXISTS "Org members can delete campaign research" ON campaign_research;
CREATE POLICY "Org members can delete campaign research"
  ON campaign_research FOR DELETE USING (EXISTS (
    SELECT 1 FROM campaigns c WHERE c.id = campaign_id AND (is_org_member(c.org_id) OR is_super_admin())
  ));

-- ============================================================
-- 8. CAMPAIGN STRATEGIES
-- ============================================================
CREATE TABLE IF NOT EXISTS campaign_strategies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  grid_data jsonb NOT NULL DEFAULT '{}',
  concepts jsonb NOT NULL DEFAULT '[]',
  selected_concept_ids uuid[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','reviewing','approved')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE campaign_strategies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can view strategies" ON campaign_strategies;
CREATE POLICY "Org members can view strategies"
  ON campaign_strategies FOR SELECT USING (EXISTS (
    SELECT 1 FROM campaigns c WHERE c.id = campaign_id AND (is_org_member(c.org_id) OR is_super_admin())
  ));

DROP POLICY IF EXISTS "Org members can create strategies" ON campaign_strategies;
CREATE POLICY "Org members can create strategies"
  ON campaign_strategies FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM campaigns c WHERE c.id = campaign_id AND (is_org_member(c.org_id) OR is_super_admin())
  ));

DROP POLICY IF EXISTS "Org members can update strategies" ON campaign_strategies;
CREATE POLICY "Org members can update strategies"
  ON campaign_strategies FOR UPDATE USING (EXISTS (
    SELECT 1 FROM campaigns c WHERE c.id = campaign_id AND (is_org_member(c.org_id) OR is_super_admin())
  ));

DROP POLICY IF EXISTS "Org members can delete strategies" ON campaign_strategies;
CREATE POLICY "Org members can delete strategies"
  ON campaign_strategies FOR DELETE USING (EXISTS (
    SELECT 1 FROM campaigns c WHERE c.id = campaign_id AND (is_org_member(c.org_id) OR is_super_admin())
  ));

-- ============================================================
-- 9. CREATIVE CONCEPTS
-- ============================================================
CREATE TABLE IF NOT EXISTS creative_concepts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  strategy_id uuid REFERENCES campaign_strategies(id) ON DELETE CASCADE,
  name text NOT NULL,
  visual_direction text,
  headline_angles jsonb DEFAULT '[]',
  copy_tone text,
  platform_strategy jsonb DEFAULT '{}',
  rationale text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','revision')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE creative_concepts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can view concepts" ON creative_concepts;
CREATE POLICY "Org members can view concepts"
  ON creative_concepts FOR SELECT USING (EXISTS (
    SELECT 1 FROM campaigns c WHERE c.id = campaign_id AND (is_org_member(c.org_id) OR is_super_admin())
  ));

DROP POLICY IF EXISTS "Org members can create concepts" ON creative_concepts;
CREATE POLICY "Org members can create concepts"
  ON creative_concepts FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM campaigns c WHERE c.id = campaign_id AND (is_org_member(c.org_id) OR is_super_admin())
  ));

DROP POLICY IF EXISTS "Org members can update concepts" ON creative_concepts;
CREATE POLICY "Org members can update concepts"
  ON creative_concepts FOR UPDATE USING (EXISTS (
    SELECT 1 FROM campaigns c WHERE c.id = campaign_id AND (is_org_member(c.org_id) OR is_super_admin())
  ));

DROP POLICY IF EXISTS "Org members can delete concepts" ON creative_concepts;
CREATE POLICY "Org members can delete concepts"
  ON creative_concepts FOR DELETE USING (EXISTS (
    SELECT 1 FROM campaigns c WHERE c.id = campaign_id AND (is_org_member(c.org_id) OR is_super_admin())
  ));

-- ============================================================
-- 10. CREATIVES (generated assets)
-- ============================================================
CREATE TABLE IF NOT EXISTS creatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  concept_id uuid REFERENCES creative_concepts(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('copy','image','video')),
  platform text CHECK (platform IN ('meta_feed','meta_stories','x','linkedin','multi')),
  content jsonb NOT NULL DEFAULT '{}',
  asset_url text,
  canva_design_id text,
  canva_edit_url text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','reviewing','approved','deployed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE creatives ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can view creatives" ON creatives;
CREATE POLICY "Org members can view creatives"
  ON creatives FOR SELECT USING (EXISTS (
    SELECT 1 FROM campaigns c WHERE c.id = campaign_id AND (is_org_member(c.org_id) OR is_super_admin())
  ));

DROP POLICY IF EXISTS "Org members can create creatives" ON creatives;
CREATE POLICY "Org members can create creatives"
  ON creatives FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM campaigns c WHERE c.id = campaign_id AND (is_org_member(c.org_id) OR is_super_admin())
  ));

DROP POLICY IF EXISTS "Org members can update creatives" ON creatives;
CREATE POLICY "Org members can update creatives"
  ON creatives FOR UPDATE USING (EXISTS (
    SELECT 1 FROM campaigns c WHERE c.id = campaign_id AND (is_org_member(c.org_id) OR is_super_admin())
  ));

DROP POLICY IF EXISTS "Org members can delete creatives" ON creatives;
CREATE POLICY "Org members can delete creatives"
  ON creatives FOR DELETE USING (EXISTS (
    SELECT 1 FROM campaigns c WHERE c.id = campaign_id AND (is_org_member(c.org_id) OR is_super_admin())
  ));

-- ============================================================
-- 11. APPROVALS
-- ============================================================
CREATE TABLE IF NOT EXISTS approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('concept','creative','strategy','deployment','optimization')),
  item_id uuid NOT NULL,
  item_summary text,
  agent_reasoning text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','edited')),
  reviewer_id uuid REFERENCES auth.users(id),
  feedback text,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can view approvals" ON approvals;
CREATE POLICY "Org members can view approvals"
  ON approvals FOR SELECT USING (is_org_member(org_id) OR is_super_admin());

DROP POLICY IF EXISTS "Org members can create approvals" ON approvals;
CREATE POLICY "Org members can create approvals"
  ON approvals FOR INSERT WITH CHECK (is_org_member(org_id) OR is_super_admin());

DROP POLICY IF EXISTS "Org members can update approvals" ON approvals;
CREATE POLICY "Org members can update approvals"
  ON approvals FOR UPDATE USING (is_org_member(org_id) OR is_super_admin());

DROP POLICY IF EXISTS "Org members can delete approvals" ON approvals;
CREATE POLICY "Org members can delete approvals"
  ON approvals FOR DELETE USING (is_org_member(org_id) OR is_super_admin());

-- ============================================================
-- 12. DECISIONS LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS decisions_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  agent text NOT NULL,
  decision_type text NOT NULL,
  decision text NOT NULL,
  reasoning text,
  evidence jsonb DEFAULT '{}',
  alternatives_considered jsonb DEFAULT '[]',
  confidence numeric DEFAULT 0.5,
  reversible boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE decisions_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can view decisions" ON decisions_log;
CREATE POLICY "Org members can view decisions"
  ON decisions_log FOR SELECT USING (EXISTS (
    SELECT 1 FROM campaigns c WHERE c.id = campaign_id AND (is_org_member(c.org_id) OR is_super_admin())
  ));

DROP POLICY IF EXISTS "System can create decisions" ON decisions_log;
CREATE POLICY "System can create decisions"
  ON decisions_log FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM campaigns c WHERE c.id = campaign_id AND (is_org_member(c.org_id) OR is_super_admin())
  ));

-- ============================================================
-- 13. JOBS (async task queue)
-- ============================================================
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','running','completed','failed')),
  input jsonb DEFAULT '{}',
  result jsonb,
  error text,
  started_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can view jobs" ON jobs;
CREATE POLICY "Org members can view jobs"
  ON jobs FOR SELECT USING (is_org_member(org_id) OR is_super_admin());

DROP POLICY IF EXISTS "Org members can create jobs" ON jobs;
CREATE POLICY "Org members can create jobs"
  ON jobs FOR INSERT WITH CHECK (is_org_member(org_id) OR is_super_admin());

DROP POLICY IF EXISTS "Org members can update jobs" ON jobs;
CREATE POLICY "Org members can update jobs"
  ON jobs FOR UPDATE USING (is_org_member(org_id) OR is_super_admin());

-- ============================================================
-- 14. ENABLE SUPABASE REALTIME
-- ============================================================
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE jobs;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE campaigns;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE approvals;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 15. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_org_members_user ON org_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON org_members(org_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_org ON campaigns(org_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaign_research_campaign ON campaign_research(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_strategies_campaign ON campaign_strategies(campaign_id);
CREATE INDEX IF NOT EXISTS idx_creative_concepts_campaign ON creative_concepts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_creatives_campaign ON creatives(campaign_id);
CREATE INDEX IF NOT EXISTS idx_approvals_org ON approvals(org_id);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);
CREATE INDEX IF NOT EXISTS idx_jobs_org ON jobs(org_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_decisions_log_campaign ON decisions_log(campaign_id);

-- ============================================================
-- 16. UPDATED_AT TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON profiles;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON organizations;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON brand_kits;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON brand_kits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON campaigns;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON campaign_strategies;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON campaign_strategies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 17. SET ADMIN USER
-- ============================================================
UPDATE profiles SET is_super_admin = true
WHERE id = (SELECT id FROM auth.users WHERE email = 'jamesflynn@me.com');
