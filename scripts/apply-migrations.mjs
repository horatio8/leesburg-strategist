#!/usr/bin/env node
/**
 * Migration runner for Supabase Postgres.
 *
 * Reads SQL files from supabase/migrations/ and applies them in
 * filename-sorted order, tracking applied migrations in a
 * `_applied_migrations` table so each file is only run once.
 *
 * Usage:
 *   DATABASE_URL="postgresql://postgres.[ref]:[password]@..." node scripts/apply-migrations.mjs
 *
 * Or set DATABASE_URL in .env.local and run:
 *   node scripts/apply-migrations.mjs
 *
 * Options:
 *   --dry-run   Print which migrations would be applied without executing them.
 *   --force     Re-apply all migrations even if already tracked.
 */

import { readFileSync, readdirSync, existsSync } from "fs";
import { join, basename } from "path";
import pg from "pg";

const { Client } = pg;

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const MIGRATIONS_DIR = join(process.cwd(), "supabase", "migrations");
const DRY_RUN = process.argv.includes("--dry-run");
const FORCE = process.argv.includes("--force");

// Load DATABASE_URL from environment or .env.local
function getDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  // Try loading from .env.local
  const envPath = join(process.cwd(), ".env.local");
  if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const match = line.match(/^DATABASE_URL=(.+)$/);
      if (match) return match[1].trim().replace(/^["']|["']$/g, "");
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Migration tracking table
// ---------------------------------------------------------------------------

const ENSURE_TRACKING_TABLE = `
  CREATE TABLE IF NOT EXISTS _applied_migrations (
    id serial PRIMARY KEY,
    filename text UNIQUE NOT NULL,
    applied_at timestamptz NOT NULL DEFAULT now(),
    checksum text
  );
`;

async function getAppliedMigrations(client) {
  const { rows } = await client.query(
    "SELECT filename FROM _applied_migrations ORDER BY filename"
  );
  return new Set(rows.map((r) => r.filename));
}

async function recordMigration(client, filename, checksum) {
  await client.query(
    "INSERT INTO _applied_migrations (filename, checksum) VALUES ($1, $2) ON CONFLICT (filename) DO UPDATE SET applied_at = now(), checksum = $2",
    [filename, checksum]
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function simpleChecksum(content) {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const chr = content.charCodeAt(i);
    hash = ((hash << 5) - hash + chr) | 0;
  }
  return hash.toString(16);
}

function getMigrationFiles() {
  if (!existsSync(MIGRATIONS_DIR)) {
    console.error(`Migrations directory not found: ${MIGRATIONS_DIR}`);
    process.exit(1);
  }

  return readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) {
    console.error(
      "DATABASE_URL not set. Provide it via environment variable or .env.local."
    );
    console.error(
      "\nYou can find your connection string in the Supabase Dashboard:"
    );
    console.error("  Settings → Database → Connection string → URI\n");
    process.exit(1);
  }

  const files = getMigrationFiles();
  if (files.length === 0) {
    console.log("No migration files found.");
    return;
  }

  console.log(`Found ${files.length} migration file(s):\n`);
  for (const f of files) console.log(`  ${f}`);
  console.log();

  if (DRY_RUN) {
    console.log("(dry-run mode — no changes will be applied)\n");
  }

  const client = new Client({ connectionString: databaseUrl });

  try {
    await client.connect();
    console.log("Connected to database.\n");

    // Ensure tracking table exists
    await client.query(ENSURE_TRACKING_TABLE);

    const applied = FORCE ? new Set() : await getAppliedMigrations(client);
    let appliedCount = 0;
    let skippedCount = 0;

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`  ✓ ${file} (already applied, skipping)`);
        skippedCount++;
        continue;
      }

      const filePath = join(MIGRATIONS_DIR, file);
      const sql = readFileSync(filePath, "utf-8");
      const checksum = simpleChecksum(sql);

      if (DRY_RUN) {
        console.log(`  → ${file} (would apply)`);
        appliedCount++;
        continue;
      }

      console.log(`  → Applying ${file}...`);
      try {
        await client.query("BEGIN");
        await client.query(sql);
        await recordMigration(client, file, checksum);
        await client.query("COMMIT");
        console.log(`    ✓ Applied successfully.`);
        appliedCount++;
      } catch (err) {
        await client.query("ROLLBACK");
        console.error(`    ✗ Failed: ${err.message}`);
        console.error(`\nAborting. Fix the issue and re-run.\n`);
        process.exit(1);
      }
    }

    console.log(
      `\nDone. Applied: ${appliedCount}, Skipped: ${skippedCount}, Total: ${files.length}`
    );
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
