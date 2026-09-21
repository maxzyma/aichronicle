import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { fetchText } from './http.mjs';
import { discoverySchema, fetchDiscovery } from './discovery.mjs';
import { parseFeed, applySuccess, applyFailure } from './normalize.mjs';
const root = fileURLToPath(new URL('../../', import.meta.url));
const feedSchema = z.object({id:z.string().regex(/^[a-z0-9-]+$/),url:z.url(),hosts:z.array(z.string()).min(1),publisher:z.string()}).strict();
export const emptyState = () => ({version:1,feeds:{},candidates:{}});
export async function fetchFeed(feed, fetcher = fetch) {
  const initial = new URL(feed.url);
  if (initial.protocol !== 'https:' || !feed.hosts.includes(initial.hostname)) throw new Error('Invalid configured feed URL');
  return parseFeed(await fetchText(feed.url, fetcher), feed);
}
export async function collect(state, feeds, fetcher = fetch) {
  let next = state;
  for (const feed of feeds) {
    const now = new Date().toISOString();
    try {
      const result = feed.kind ? await fetchDiscovery(feed,fetcher) : {entries:await fetchFeed(feed,fetcher)};
      const entries=result.entries.filter((e) => !e.publishedAt || (Date.parse(e.publishedAt)<=Date.parse(now)
        && Date.parse(e.publishedAt)>=Date.parse(now)-90*86400000));
      next=applySuccess(next,feed,entries,now,result.coverage);
    }
    catch (error) { next = applyFailure(next, feed, `${error.message}${error.cause?.message ? `: ${error.cause.message}` : ''}`, now); }
  }
  return next;
}
async function main() {
  const stateFile = path.resolve(process.env.STATE_FILE || path.join(root,'.runtime/state.json'));
  const feeds = [
    ...z.array(feedSchema).parse(JSON.parse(await fs.readFile(path.join(root,'automation/feeds.json'),'utf8'))),
    ...z.array(discoverySchema).parse(JSON.parse(await fs.readFile(path.join(root,'automation/discovery.json'),'utf8'))),
  ];
  if (new Set(feeds.map((f) => f.id)).size !== feeds.length) throw new Error('Duplicate source ID');
  let state;
  try { state = JSON.parse(await fs.readFile(stateFile,'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw error; state = emptyState(); }
  if (state.version !== 1 || !state.feeds || !state.candidates) throw new Error('Invalid state; restore from history');
  const next = await collect(state,feeds);
  await fs.mkdir(path.dirname(stateFile),{recursive:true});
  await fs.writeFile(`${stateFile}.tmp`,JSON.stringify(next,null,2)+'\n');
  await fs.rename(`${stateFile}.tmp`,stateFile);
  const failures = feeds.filter((feed) => next.feeds[feed.id]?.error);
  console.info(`Candidates: ${Object.keys(next.candidates).length}; source failures: ${failures.length}/${feeds.length}`);
  for (const feed of failures) console.error(`${feed.id}: ${next.feeds[feed.id].error}`);
  if (failures.length) process.exitCode = 1;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {console.error(`Collection failed: ${error.message}`);process.exitCode=1;});
}
