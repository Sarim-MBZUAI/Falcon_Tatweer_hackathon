/**
 * Dev helper: list the Anam voices available to this account so we can pick a
 * good Arabic-capable male voice. Prints only voice metadata (never the key).
 * Run with: `npx tsx scripts/list-voices.ts`
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
  const key = process.env.ANAM_API_KEY;
  if (!key) throw new Error("ANAM_API_KEY not set");

  const res = await fetch("https://api.anam.ai/v1/voices", {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!res.ok) throw new Error(`voices failed ${res.status}: ${await res.text()}`);
  const json = await res.json();
  const arr: Record<string, unknown>[] = Array.isArray(json)
    ? json
    : json.data || json.voices || [];

  console.log("total voices:", arr.length);
  for (const v of arr) {
    const tags = Array.isArray(v.displayTags) ? (v.displayTags as string[]).join(",") : "";
    console.log(
      JSON.stringify({
        id: v.id,
        name: v.name ?? v.displayName,
        gender: v.gender,
        provider: v.provider,
        language: v.language ?? v.languageCode ?? v.locale,
        tags,
      })
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
