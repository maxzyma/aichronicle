import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../../', import.meta.url));
const safe = (text) => String(text).replace(/[\[\]<>`\\\r\n]/g,' ').replace(/@/g,'＠');
try {
  const state = JSON.parse(await fs.readFile(process.env.STATE_FILE || path.join(root,'.runtime/state.json'),'utf8'));
  const mode = process.argv.includes('--weekly') ? 'weekly' : 'daily';
  const since = Date.now() - (mode === 'weekly' ? 7 : 1) * 86400000;
  const entries = Object.values(state.candidates).filter((c) => Date.parse(c.updatedAt) >= since)
    .toSorted((a,b) => b.updatedAt.localeCompare(a.updatedAt));
  const health = Object.entries(state.feeds).map(([id,s]) => `- ${safe(id)}: ${s.error ? `FAILED (${safe(s.error)})` : 'OK'}; last success: ${s.lastSuccess ?? 'never'}`).join('\n');
  const lines = entries.map((c) => `- [${safe(c.title)}](<${c.url.replace(/[<>\s]/g,encodeURIComponent)}>) — ${safe(c.publisher)} · ${c.publishedAt?.slice(0,10) ?? 'date unknown'} · unreviewed`);
  const directory = path.join(root,'.runtime/reports');
  await fs.mkdir(directory,{recursive:true});
  await fs.writeFile(path.join(directory,`${mode}.md`),`# ${mode === 'weekly' ? 'Weekly retrospective candidates' : 'Daily candidate review'}\n\nGenerated ${new Date().toISOString()}. These are leads, not verified events.\n\n## Source health\n\n${health}\n\n## ${entries.length} new or revised leads\n\n${lines.join('\n') || 'No new candidates in this window.'}\n\n## Editor actions\n\nCheck primary date and availability, distinguish claims from independent evidence, select timeline membership, and follow the editorial review gate. Consult automation/watchlist.json for sources without feeds.\n`);
  console.info(`${mode} review: ${entries.length} leads; written to .runtime/reports/${mode}.md`);
} catch (error) { console.error(`Report failed: ${error.message}`); process.exitCode=1; }
