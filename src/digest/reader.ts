import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { DigestRow, JobStatus, NightDigest, NightLink, ReadNight } from './types.js';

// Parse one JSONL line at the edge; return null for anything that isn't a well-formed entry
// (plan.md § 1: a bad line is counted, never thrown).
type Entry = { at: string; job: string; status: JobStatus; owner: string | null; error: string | null };

function parseLine(line: string): Entry | null {
  let o: unknown;
  try {
    o = JSON.parse(line);
  } catch {
    return null;
  }
  if (typeof o !== 'object' || o === null) return null;
  const r = o as Record<string, unknown>;
  const { at, job, status, owner, error } = r;
  if (typeof at !== 'string' || typeof job !== 'string') return null;
  if (status !== 'ok' && status !== 'retry' && status !== 'fail') return null;
  return {
    at,
    job,
    status,
    owner: typeof owner === 'string' ? owner : null,
    error: typeof error === 'string' ? error : null,
  };
}

function fold(entries: Entry[]): DigestRow {
  const sorted = [...entries].sort((a, b) => a.at.localeCompare(b.at));
  const last = sorted[sorted.length - 1];
  const lastWithError = [...sorted].reverse().find((e) => e.error !== null);
  return {
    job: last.job,
    owner: last.owner,
    runs: sorted.length,
    retries: sorted.filter((e) => e.status === 'retry').length,
    lastStatus: last.status,
    lastError: lastWithError?.error ?? null,
    firstAt: sorted[0].at,
    lastAt: last.at,
  };
}

export const readNight: ReadNight = (runsDir, night): NightDigest | null => {
  let text: string;
  try {
    text = readFileSync(join(runsDir, `${night}.jsonl`), 'utf8');
  } catch {
    return null; // no file for this night -> 404 at the route
  }

  const lines = text.split('\n').filter((l) => l.trim() !== '');
  let badLines = 0;
  const counts = { ok: 0, retry: 0, fail: 0 };
  const byJob = new Map<string, Entry[]>();

  for (const line of lines) {
    const e = parseLine(line);
    if (e === null) {
      badLines += 1;
      continue;
    }
    counts[e.status] += 1;
    const arr = byJob.get(e.job);
    if (arr) arr.push(e);
    else byJob.set(e.job, [e]);
  }

  const rows = [...byJob.values()].map(fold).sort((a, b) => a.job.localeCompare(b.job));
  return { night, rows, badLines, counts };
};

// For the status board: each night on disk with its status counts (plan.md § 2c).
export function nightLinks(runsDir: string, nights: string[]): NightLink[] {
  return nights.flatMap((night) => {
    const digest = readNight(runsDir, night);
    return digest ? [{ night, ...digest.counts }] : [];
  });
}
