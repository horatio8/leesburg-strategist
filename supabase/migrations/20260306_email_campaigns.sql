-- Email campaigns table
CREATE TABLE IF NOT EXISTS email_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  brand_kit_id uuid REFERENCES brand_kits(id) ON DELETE SET NULL,
  framework_id uuid REFERENCES messaging_frameworks(id) ON DELETE SET NULL,
  name text NOT NULL DEFAULT 'Untitled Email Campaign',
  brief jsonb DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','generating','active','complete','archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_campaigns_campaign ON email_campaigns(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_org ON email_campaigns(org_id);

-- Individual emails within a campaign
CREATE TABLE IF NOT EXISTS email_campaign_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_campaign_id uuid NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
  sequence_number integer NOT NULL DEFAULT 1,
  send_date date,
  subject text NOT NULL DEFAULT '',
  preview_text text DEFAULT '',
  heading_image_prompt text DEFAULT '',
  heading_image_url text DEFAULT '',
  introduction text DEFAULT '',
  body text DEFAULT '',
  cta_text text DEFAULT 'Learn More',
  cta_url text DEFAULT '#',
  signature text DEFAULT '',
  email_type text DEFAULT 'appeal',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','review','approved','sent')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_emails_campaign ON email_campaign_emails(email_campaign_id);

-- Updated-at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_email_campaigns_updated ON email_campaigns;
CREATE TRIGGER trg_email_campaigns_updated BEFORE UPDATE ON email_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_email_emails_updated ON email_campaign_emails;
CREATE TRIGGER trg_email_emails_updated BEFORE UPDATE ON email_campaign_emails
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaign_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_member_email_campaigns" ON email_campaigns
  FOR ALL USING (is_org_member(org_id) OR is_super_admin());

CREATE POLICY "org_member_email_emails" ON email_campaign_emails
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM email_campaigns ec
      WHERE ec.id = email_campaign_emails.email_campaign_id
        AND (is_org_member(ec.org_id) OR is_super_admin())
    )
  );
