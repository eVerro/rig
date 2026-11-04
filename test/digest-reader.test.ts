import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { readNight } from '../src/digest/reader.js';

// runs/ is read-only (AGENTS.md). Tests write their own fixtures to a temp dir, except the
// one case the plan names explicitly, which reads the committed fixture.
function tempRuns(night: string, body: string): string {
  const dir = mkdtempSync(join(tmpdir(), 'rig-runs-'));
  writeFileSync(join(dir, `${night}.jsonl`), body);
  return dir;
}

describe('readNight', () => {
  it('folds runs/2026-10-28.jsonl: 5 jobs, 1 bad line', () => {
    const digest = readNight('runs', '2026-10-28');
    expect(digest).not.toBeNull();
    expect(digest!.rows.length).toBe(5);
    expect(digest!.badLines).toBe(1);
    expect(digest!.rows.map((r) => r.job)).toEqual([
      'digest/render',
      'fixtures/refresh',
      'lane/sync',
      'notes/backup',
      'rig/rotate-logs',
    ]);
  });

  it('counts runs, retries, last status and last error per job', () => {
    const digest = readNight('runs', '2026-10-28')!;
    const refresh = digest.rows.find((r) => r.job === 'fixtures/refresh')!;
    expect(refresh.runs).toBe(4);
    expect(refresh.retries).toBe(3);
    expect(refresh.lastStatus).toBe('ok');
    expect(refresh.lastError).toBe('upstream 503');

    const backup = digest.rows.find((r) => r.job === 'notes/backup')!;
    expect(backup.lastStatus).toBe('fail');
    expect(backup.lastError).toBe('quota exceeded');
  });

  it('keeps a null owner instead of dropping the row', () => {
    const dir = tempRuns('2026-01-01', '{"at":"2026-01-01T00:00:00+01:00","job":"x","status":"ok","owner":null}\n');
    const digest = readNight(dir, '2026-01-01')!;
    expect(digest.rows.length).toBe(1);
    expect(digest.rows[0].owner).toBeNull();
  });

  it('returns null when the night has no file', () => {
    expect(readNight('runs', '1999-12-31')).toBeNull();
  });

  it('renders an empty file as a night with no rows', () => {
    const dir = tempRuns('2026-02-02', '');
    const digest = readNight(dir, '2026-02-02')!;
    expect(digest).not.toBeNull();
    expect(digest.rows).toEqual([]);
  });
});
