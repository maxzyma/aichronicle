import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));
const safe=(text)=>String(text).replace(/[\[\]<>`\\\r\n]/g,' ').replace(/@/g,'＠');
function section(title,entries) {
  const lines=entries.slice(0,200).map((c)=>{
    const channels=(c.channels ?? []).map((s)=>safe(s.id)).join(', ') || safe(c.feed);
    return `- [${safe(c.title)}](<${c.url.replace(/[<>\s]/g,encodeURIComponent)}>) — ${safe(c.publisher)} · ${c.publishedAt?.slice(0,10) ?? 'publication date unknown'} · ${channels} · unreviewed`;
  });
  const note=entries.length>200 ? `\n\nShowing 200/${entries.length}; remaining leads are retained in automation-state/state.json.` : '';
  return `\n## ${title} (${entries.length})\n\n${lines.join('\n') || 'No new leads in this window.'}${note}\n`;
}
try {
  const state=JSON.parse(await fs.readFile(process.env.STATE_FILE || path.join(root,'.runtime/state.json'),'utf8'));
  const watchlist=JSON.parse(await fs.readFile(path.join(root,'automation/watchlist.json'),'utf8'));
  const mode=process.argv.includes('--weekly')?'weekly':'daily';
  const coverageText=mode==='weekly'
    ? await fs.readFile(path.join(root,'research/reviews/coverage.md'),'utf8') : '';
  const coverage=coverageText ? '\n\n## Coverage review — manual work required\n\n'
    +coverageText.replace(/\]\((?!https?:|#)([^)]+)\)/g,(_,target)=>
      `](${new URL(target,'https://github.com/maxzyma/aichronicle/blob/main/research/reviews/').href})`) : '';
  const since=Date.now()-(mode==='weekly'?7:1)*86400000;
  const entries=Object.values(state.candidates).filter((c)=>Date.parse(c.updatedAt)>=since)
    .toSorted((a,b)=>b.updatedAt.localeCompare(a.updatedAt));
  const health=Object.entries(state.feeds).map(([id,s])=>`- ${safe(id)}: ${s.error?`FAILED (${safe(s.error)})`:'OK'}; last success: ${s.lastSuccess ?? 'never'}${s.coverage?.capped?'; BOUNDED RESULTS: page limit or upstream incomplete result reached':''}`).join('\n');
  const manual=watchlist.filter((s)=>mode==='weekly'||s.cadence==='daily')
    .map((s)=>`- [${safe(s.publisher)}](${s.url}) — MANUAL CHECK REQUIRED: ${safe(s.reason)}`).join('\n');
  const report=`# ${mode==='weekly'?'Weekly retrospective candidates':'Daily candidate review'}\n\nGenerated ${new Date().toISOString()}. Leads are not verified events.\n\n## Source health\n\n${health}\n`
    +section('Publisher feeds',entries.filter((c)=>c.evidence!=='discovery-only'))
    +section('Community and repository discovery',entries.filter((c)=>c.evidence==='discovery-only'))
    +`\nDiscovery dates refer to HN posts, not the linked product release. Repository creation dates are retained separately, not treated as event dates. Stars and discussion activity guide investigation, never milestone admission.\n\n## Manual source checks\n\n${manual || 'See the weekly watchlist.'}\n\n## Editor actions\n\nOpen the original publisher, distinguish launch / availability / adoption, verify dates and claims, select timeline membership, and follow the human review gate. Bounded searches are not exhaustive coverage.\n`;
  const directory=path.join(root,'.runtime/reports');
  await fs.mkdir(directory,{recursive:true});
  await fs.writeFile(path.join(directory,`${mode}.md`),report+coverage);
  console.info(`${mode} review: ${entries.length} leads; written to .runtime/reports/${mode}.md`);
} catch (error) { console.error(`Report failed: ${error.message}`); process.exitCode=1; }
