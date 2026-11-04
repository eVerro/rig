import type { DigestRow, NightDigest } from '../digest/types.js';

// A night folded to one row per job (plan.md § 2a). Retries of 3+ and any fail are marked;
// missing data renders as "—" (styleguide). Server-rendered, no client JS (ADR 0001).
function dash(value: string | null): string {
  return value === null || value === '' ? '—' : value;
}

function Row({ row }: { row: DigestRow }) {
  const warn = row.lastStatus === 'fail' || row.retries >= 3;
  return (
    <tr class={warn ? 'warn' : undefined}>
      <td>{row.job}</td>
      <td>{dash(row.owner)}</td>
      <td>{row.runs}</td>
      <td>{row.retries}</td>
      <td>{row.lastStatus}</td>
      <td>{dash(row.lastError)}</td>
      <td>{row.firstAt}</td>
      <td>{row.lastAt}</td>
    </tr>
  );
}

export function Digest({ digest }: { digest: NightDigest }) {
  return (
    <>
      <h1>digest · {digest.night}</h1>
      {digest.rows.length === 0 ? (
        <p class="mute">nothing ran</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>job</th>
              <th>owner</th>
              <th>runs</th>
              <th>retries</th>
              <th>last status</th>
              <th>last error</th>
              <th>first</th>
              <th>last</th>
            </tr>
          </thead>
          <tbody>
            {digest.rows.map((row) => (
              <Row row={row} />
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
