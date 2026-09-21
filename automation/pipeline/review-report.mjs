import fs from 'node:fs';
import path from 'node:path';
import { loadContent, ROOT } from '../checks/content.mjs';
import { fingerprint, isApproved } from '../checks/model.mjs';
try {
  const { events, sources, timelines, batch, approvals } = loadContent();
  const approved = events.filter((event) => isApproved(event, sources, timelines, approvals)).length;
  const intro = `# 首批事件审核包\n\n研究截止：${batch.research_cutoff}。共 ${events.length} 条，已批准 ${approved} 条；其余记录不进入正式站点。审核状态以当前内容指纹及[批准记录](../../content/approvals.json)为准。\n\n返回[研究索引](../README.md)。逐项检查日期、事实、来源和入选判断；通过后按[运维手册](../../docs/runbook.md)记录审核。\n`;
  const entries = events.map((event) => {
    const refs = sources.filter((s) => event.sources.includes(s.id)).map((s) => `- [${s.title}](${s.url})：${s.supports}`).join('\n');
    return `\n## ${event.date} · ${event.title}\n\n[事件原件](../../content/events/${event.id}.md) · ${event.category}\n\n${event.summary}\n\n入选判断：${event.significance}\n\n${refs}\n\n内容指纹：\`${fingerprint(event, sources, timelines)}\`\n`;
  });
  fs.writeFileSync(path.join(ROOT, 'research/reviews/initial-review.md'), intro + entries.join(''));
  console.info(`Review packet generated for ${events.length} events.`);
} catch (error) { console.error(error.message); process.exitCode = 1; }
