import { describe, expect, it } from 'vitest';
import { readNight } from '../src/digest/reader.js';
import { summarize } from '../src/digest/summary.js';

describe('summarize', () => {
  it('folds the 2026-10-28 digest to night totals', () => {
    const digest = readNight('runs', '2026-10-28')!;
    const s = summarize(digest.rows);
    expect(s.jobs).toBe(5);
    expect(s.okJobs).toBe(4);
    expect(s.failJobs).toBe(1);
    expect(s.retryJobs).toBe(0);
    expect(s.totalRetries).toBe(4); // fixtures/refresh (3) + lane/sync (1)
    expect(s.failedJobs).toEqual(['notes/backup']);
  });

  it('returns zeros for an empty night', () => {
    expect(summarize([])).toEqual({
      jobs: 0,
      okJobs: 0,
      retryJobs: 0,
      failJobs: 0,
      totalRetries: 0,
      failedJobs: [],
    });
  });
});
