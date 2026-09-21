import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { loadContent, ROOT } from '../checks/content.mjs';
import { fingerprint } from '../checks/model.mjs';
try {
  if (process.env.CI || process.env.GITHUB_ACTIONS) throw new Error('Human review cannot run in CI');
  const input = process.argv[process.argv.indexOf('--ids') + 1];
  if (!process.argv.includes('--ids') || !input || !/^[a-z0-9,-]+$/.test(input)) throw new Error('Specify reviewed event IDs with --ids id1,id2');
  const reviewer = execFileSync('gh',['api','user','--jq','.login'],{encoding:'utf8'}).trim();
  const reviewers = JSON.parse(fs.readFileSync(path.join(ROOT,'automation/reviewers.json'),'utf8'));
  if (!reviewers.includes(reviewer)) throw new Error('Authenticated account is not a configured reviewer');
  const data = loadContent();
  const ids = [...new Set(input.split(','))];
  const selected = ids.map((id) => {
    const event = data.events.find((e) => e.id === id);
    if (!event) throw new Error(`Unknown event: ${id}`);
    return {event:id,hash:fingerprint(event,data.sources,data.timelines),reviewer,reviewedAt:new Date().toISOString(),decision:'approved'};
  });
  const approvals = [...data.approvals.filter((a) => !ids.includes(a.event)),...selected];
  fs.writeFileSync(path.join(ROOT,'content/approvals.json'),JSON.stringify(approvals,null,2)+'\n');
  console.info(`Recorded human review by ${reviewer} for ${selected.length} events.`);
} catch (error) { console.error(`Approval failed: ${error.message}`); process.exitCode=1; }
