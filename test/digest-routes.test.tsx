import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import type { DigestRow } from '../src/digest/types.js';

// runs/ is read-only. Build a temp runs dir per case (plan.md § 2d).
function appWith(files: Record<string, string>) {
  const dir = mkdtempSync(join(tmpdir(), 'rig-routes-'));
  for (const [name, body] of Object.entries(files)) writeFileSync(join(dir, name), body);
  return createApp({ adapter: 'shim', installed: '2026-10-29T14:06:00+01:00', beatEverySeconds: 60, runsDir: dir });
}

const twoJobs =
  '{"at":"2026-03-01T01:00:00+01:00","job":"b","status":"ok","owner":"rook"}\n' +
  'not json\n' +
  '{"at":"2026-03-01T02:00:00+01:00","job":"a","status":"fail","owner":null,"error":"boom"}\n';

describe('digest routes', () => {
  it('page returns 200 and renders the rows', async () => {
    const res = await appWith({ '2026-03-01.jsonl': twoJobs }).request('/digest/2026-03-01');
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('digest · 2026-03-01');
    expect(html).toContain('boom');
  });

  it('json returns 200 and the same jobs, in the same order, as the page', async () => {
    const res = await appWith({ '2026-03-01.jsonl': twoJobs }).request('/api/digest/2026-03-01');
    expect(res.status).toBe(200);
    const rows = (await res.json()) as DigestRow[];
    expect(rows.map((r) => r.job)).toEqual(['a', 'b']); // sorted by job, same as the page
  });

  it('a night with no file returns 404 on both routes', async () => {
    const app = appWith({ '2026-03-01.jsonl': twoJobs });
    expect((await app.request('/digest/1999-01-01')).status).toBe(404);
    expect((await app.request('/api/digest/1999-01-01')).status).toBe(404);
  });

  it('an empty night renders "nothing ran" and empty JSON', async () => {
    const app = appWith({ '2026-04-04.jsonl': '' });
    const page = await app.request('/digest/2026-04-04');
    expect(page.status).toBe(200);
    expect(await page.text()).toContain('nothing ran');
    const json = await (await app.request('/api/digest/2026-04-04')).json();
    expect(json).toEqual([]);
  });

  it('a night with a bad line still renders', async () => {
    const res = await appWith({ '2026-03-01.jsonl': twoJobs }).request('/digest/2026-03-01');
    expect(res.status).toBe(200); // the bad line was counted, not thrown
  });
});
