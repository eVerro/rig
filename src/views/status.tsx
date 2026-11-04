import type { Status } from '../status.js';
import type { NightLink } from '../digest/types.js';

export function StatusBoard({ status, nights }: { status: Status; nights: NightLink[] }) {
  return (
    <>
      <h1>status</h1>
      <table>
        <tbody>
          <tr><th>adapter</th><td>{status.adapter}</td></tr>
          <tr><th>installed</th><td>{status.installed}</td></tr>
          <tr>
            <th>last beat</th>
            <td>{status.lastBeat ? `${status.lastBeat.at} · pid ${status.lastBeat.pid}` : <span class="warn">none</span>}</td>
          </tr>
        </tbody>
      </table>
      <h2>nights on disk</h2>
      {nights.length === 0 ? (
        <p class="mute">nothing in runs/</p>
      ) : (
        <ul>
          {nights.map((n) => (
            <li>
              <a href={`/digest/${n.night}`}>{n.night}</a>{' '}
              <span class="mute">
                {n.ok} ok · {n.retry} retry · {n.fail} fail
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
