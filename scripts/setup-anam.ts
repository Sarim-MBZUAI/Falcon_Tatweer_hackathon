/**
 * One-time setup: create the Hakim AI avatar + persona on Anam and persist the
 * ids to anam-agent.json. Safe to run repeatedly (it no-ops if the file
 * already exists). Run with: `npm run setup:anam`.
 *
 * The Next.js app also creates the agent lazily on first request, so running
 * this script is optional. It's useful to pre-warm the (slow) avatar creation.
 */

import { promises as fs } from "fs";
import path from "path";

// Load .env into process.env (a standalone script does not get Next's loader).
async function loadDotEnv() {
  try {
    const raw = await fs.readFile(path.join(process.cwd(), ".env"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // No .env file; rely on the ambient environment.
  }
}

async function main() {
  await loadDotEnv();
  const { ensureAgent } = await import("../lib/anam");
  const agent = await ensureAgent();
  console.log("\nHakim AI agent ready:");
  console.log(JSON.stringify(agent, null, 2));
  if (agent.avatarIsFallback) {
    console.warn(
      "\nNote: a stock avatar was used because custom avatar creation was not available on this plan."
    );
  }
}

main().catch((err) => {
  console.error("\nSetup failed:", err);
  process.exit(1);
});
