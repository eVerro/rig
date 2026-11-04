import type { DigestRow } from './types.js';

// One-line totals for a night, folded from the digest rows (plan.md § 2 follow-up).
export type NightSummary = {
  jobs: number;
  okJobs: number;
  retryJobs: number;
  failJobs: number;
  totalRetries: number;
  failedJobs: string[]; // jobs whose last status was fail, in row order
};

export function summarize(rows: DigestRow[]): NightSummary {
  const summary: NightSummary = {
    jobs: rows.length,
    okJobs: 0,
    retryJobs: 0,
    failJobs: 0,
    totalRetries: 0,
    failedJobs: [],
  };
  for (const row of rows) {
    summary.totalRetries += row.retries;
    if (row.lastStatus === 'ok') summary.okJobs += 1;
    else if (row.lastStatus === 'retry') summary.retryJobs += 1;
    else {
      summary.failJobs += 1;
      summary.failedJobs.push(row.job);
    }
  }
  return summary;
}
