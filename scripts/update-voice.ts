/**
 * Re-provision Hakim's persona with a freshly-picked (natural male) voice,
 * reusing the existing avatar. Run with: `npm run setup:voice`.
 *
 * Pick a specific voice by setting ANAM_VOICE_ID in .env before running.
 */

import { promises as fs } from "fs";
import path from "path";

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
    /* rely on ambient env */
  }
}

async function main() {
  await loadDotEnv();
  const { reprovisionPersona } = await import("../lib/anam");
  const agent = await reprovisionPersona();
  console.log("\nUpdated Hakim AI agent:");
  console.log(JSON.stringify(agent, null, 2));
}

main().catch((err) => {
  console.error("\nVoice update failed:", err);
  process.exit(1);
});
