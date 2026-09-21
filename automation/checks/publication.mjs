import fs from 'node:fs';
import path from 'node:path';
import { loadContent, ROOT } from './content.mjs';
import { isApproved } from './model.mjs';
try {
  const data=loadContent();
  const output=path.join(ROOT,'site/dist');
  if (!fs.existsSync(path.join(output,'index.html'))) throw new Error('Build the formal site first');
  const index=fs.readFileSync(path.join(output,'index.html'),'utf8');
  if (index.includes('noindex,nofollow') || index.includes('编辑预览')) throw new Error('Review preview cannot be deployed');
  for (const event of data.events) {
    const approved=isApproved(event,data.sources,data.timelines,data.approvals);
    const exists=fs.existsSync(path.join(output,'events',event.id,'index.html'));
    if (approved !== exists) throw new Error(`Publication boundary mismatch: ${event.id}`);
    if (!approved && index.includes(`data-id="${event.id}"`)) throw new Error(`Candidate in formal timeline: ${event.id}`);
  }
  console.info('Publication boundary valid: only approved event routes are present.');
} catch (error) { console.error(error.message); process.exitCode=1; }
