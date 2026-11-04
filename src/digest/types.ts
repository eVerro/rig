// The night's run log, folded to one row per job. Shared contract for § 2 (plan.md):
// the page, the JSON, the board link and the tests all read `DigestRow` and nothing else.
export type JobStatus = 'ok' | 'retry' | 'fail';

export type DigestRow = {
  job: string;
  owner: string | null; // null when the log line had no owner; shown as "—"
  runs: number;
  retries: number;
  lastStatus: JobStatus;
  lastError: string | null;
  firstAt: string; // kept with its original offset (styleguide: never convert to UTC)
  lastAt: string;
};

export type NightDigest = {
  night: string;
  rows: DigestRow[]; // sorted by job
  badLines: number; // lines that did not parse, counted not thrown
  counts: { ok: number; retry: number; fail: number }; // per line, for the board link
};

// Reads runs/<night>.jsonl. Returns null when the night has no file (the route maps that to 404).
// § 2 implements this in src/digest/reader.ts against this signature.
export type ReadNight = (runsDir: string, night: string) => NightDigest | null;
