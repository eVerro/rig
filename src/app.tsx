import { Hono } from 'hono';
import { loadConfig, type RigConfig } from './config.js';
import { lane } from './lane.js';
import { readStatus, nightsOnDisk } from './status.js';
import { readNight, nightLinks } from './digest/reader.js';
import { Layout } from './views/layout.js';
import { StatusBoard } from './views/status.js';
import { Digest } from './views/digest.js';

export function createApp(config: RigConfig = loadConfig()) {
  const app = new Hono();

  app.get('/health', (c) => c.json({ ok: true, lane: lane().id }));

  app.get('/', (c) =>
    c.html(
      <Layout title="status" lane={lane()}>
        <StatusBoard status={readStatus(config)} nights={nightLinks(config.runsDir, nightsOnDisk(config.runsDir))} />
      </Layout>,
    ),
  );

  // The digest page and its JSON read the same readNight result, so they cannot disagree (ADR 0001).
  app.get('/digest/:night', (c) => {
    const digest = readNight(config.runsDir, c.req.param('night'));
    if (digest === null) return c.notFound();
    return c.html(
      <Layout title={`digest · ${digest.night}`} lane={lane()}>
        <Digest digest={digest} />
      </Layout>,
    );
  });

  app.get('/api/digest/:night', (c) => {
    const digest = readNight(config.runsDir, c.req.param('night'));
    if (digest === null) return c.notFound();
    return c.json(digest.rows);
  });

  return app;
}
