import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import type { NightLink } from '../src/digest/types.js';

const config = { adapter: 'shim', installed: '2026-10-29T14:06:00+01:00', beatEverySeconds: 60, runsDir: 'runs' };

describe('GET /api/nights', () => {
  it('lists nights on disk, newest first, with counts', async () => {
    const res = await createApp(config).request('/api/nights');
    expect(res.status).toBe(200);
    const nights = (await res.json()) as NightLink[];
    expect(nights.map((n) => n.night)).toEqual(['2026-10-28', '2026-10-27']);
    const latest = nights[0];
    expect(latest.ok + latest.retry + latest.fail).toBeGreaterThan(0);
    expect(latest.fail).toBe(1); // notes/backup failed on 2026-10-28
  });
});
