import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import YAML from 'yaml';
import { eventSchema, sourceSchema, timelineSchema, approvalSchema, batchSchema, isApproved } from './model.mjs';

export const ROOT = process.env.CONTENT_ROOT || fileURLToPath(new URL('../../', import.meta.url));
const read = (name) => fs.readFileSync(path.join(ROOT, name), 'utf8');
function unique(items, label) {
  if (new Set(items.map((v) => v.id)).size !== items.length) throw new Error(`Duplicate ${label} ID`);
}
export function loadContent() {
  const sources = JSON.parse(read('sources/catalog/primary.json')).map((s) => sourceSchema.parse(s));
  const events = fs.readdirSync(path.join(ROOT, 'content/events')).filter((f) => f.endsWith('.md')).map((file) => {
    const { data, content } = matter(read(`content/events/${file}`));
    const parsed = eventSchema.parse(data);
    if (file !== `${parsed.id}.md`) throw new Error(`Filename mismatch: ${file}`);
    if (/<\/?[a-z][\s\S]*?>/i.test(content)) throw new Error(`Raw HTML is not allowed: ${file}`);
    return {...parsed, body: content.trim()};
  }).toSorted((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
  const timelines = fs.readdirSync(path.join(ROOT, 'content/timelines')).filter((f) => f.endsWith('.yaml'))
    .map((f) => timelineSchema.parse(YAML.parse(read(`content/timelines/${f}`))));
  const approvals = JSON.parse(read('content/approvals.json')).map((a) => approvalSchema.parse(a));
  if (new Set(approvals.map((a) => a.event)).size !== approvals.length) throw new Error('Duplicate approval');
  const batch = batchSchema.parse(JSON.parse(read('research/reviews/batch.json')));
  if (Date.parse(batch.research_cutoff) > Date.now()) throw new Error('Future research cutoff');
  unique(events, 'event'); unique(sources, 'source'); unique(timelines, 'timeline');
  for (const event of events) {
    if (event.date > batch.research_cutoff.slice(0, event.date.length)) throw new Error(`Future event: ${event.id}`);
    for (const source of event.sources) if (!sources.some((s) => s.id === source)) throw new Error(`Missing source: ${source}`);
    for (const related of event.related) if (related === event.id || !events.some((e) => e.id === related)) throw new Error(`Invalid related event: ${related}`);
  }
  for (const timeline of timelines) {
    if (new Set(timeline.entries.map((e) => e.event)).size !== timeline.entries.length) throw new Error('Duplicate timeline membership');
    for (const entry of timeline.entries) if (!events.some((e) => e.id === entry.event)) throw new Error(`Missing event: ${entry.event}`);
  }
  for (const event of events) if (!timelines.some((t) => t.entries.some((e) => e.event === event.id))) throw new Error(`Orphan event: ${event.id}`);
  for (const approval of approvals) {
    const event = events.find((e) => e.id === approval.event);
    if (!event || !isApproved(event, sources, timelines, [approval])) throw new Error(`Invalid or stale approval: ${approval.event}`);
  }
  return {events, sources, timelines, approvals, batch};
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const data = loadContent();
    const approved = data.events.filter((e) => isApproved(e, data.sources, data.timelines, data.approvals));
    console.info(`Content valid: ${data.events.length} events, ${data.timelines.length} timelines, ${approved.length} approved.`);
  } catch (error) { console.error(`Content validation failed: ${error.message}`); process.exitCode = 1; }
}
