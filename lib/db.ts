import { Pool, type QueryResultRow } from "pg";

/**
 * Postgres access. Every account feature is optional: with no DATABASE_URL the
 * app runs exactly as it did before accounts existed — anonymous, local-only.
 */

let pool: Pool | null = null;
let schemaReady: Promise<void> | null = null;

export function dbConfigured(): boolean {
  return !!process.env.DATABASE_URL;
}

function getPool(): Pool {
  if (!pool) {
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set.");
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 3,
    });
  }
  return pool;
}

/** Create the tables on first use; safe to call on every request. */
function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = getPool()
      .query(`
        CREATE TABLE IF NOT EXISTS accounts (
          id               TEXT PRIMARY KEY,
          email            TEXT UNIQUE NOT NULL,
          stripe_customer  TEXT,
          stripe_sub       TEXT,
          plan             TEXT NOT NULL DEFAULT 'free',
          plan_status      TEXT,
          period_end       TIMESTAMPTZ,
          created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE TABLE IF NOT EXISTS children (
          id          TEXT PRIMARY KEY,
          account_id  TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
          name        TEXT NOT NULL,
          grade       INT  NOT NULL,
          created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS children_account ON children(account_id);
        CREATE TABLE IF NOT EXISTS login_tokens (
          token_hash  TEXT PRIMARY KEY,
          email       TEXT NOT NULL,
          expires_at  TIMESTAMPTZ NOT NULL,
          used_at     TIMESTAMPTZ
        );
        CREATE TABLE IF NOT EXISTS sessions (
          token_hash  TEXT PRIMARY KEY,
          account_id  TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
          expires_at  TIMESTAMPTZ NOT NULL
        );
        CREATE INDEX IF NOT EXISTS sessions_account ON sessions(account_id);
        -- Free-tier usage for people who have not signed up, keyed by an
        -- anonymous id the browser generates. Survives clearing site data
        -- only in the sense that the server remembers the id it was told.
        CREATE TABLE IF NOT EXISTS finished_pieces (
          device_id   TEXT NOT NULL,
          piece_id    TEXT NOT NULL,
          created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
          PRIMARY KEY (device_id, piece_id)
        );
      `)
      .then(() => undefined)
      .catch((error) => {
        schemaReady = null; // let a later request retry
        throw error;
      });
  }
  return schemaReady;
}

export async function query<T extends QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  await ensureSchema();
  const result = await getPool().query<T>(text, params);
  return result.rows;
}

export function newId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`;
}
