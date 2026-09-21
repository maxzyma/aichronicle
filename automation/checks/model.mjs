import { z } from 'zod';
import reviewers from '../reviewers.json' with { type: 'json' };
import { createHash } from 'node:crypto';

const id = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const dateValue = z.string().regex(/^\d{4}(-\d{2}){0,2}$/).refine((value) => {
  const expanded = value.length === 4 ? `${value}-01-01` : value.length === 7 ? `${value}-01` : value;
  const date = new Date(`${expanded}T00:00:00Z`);
  return Number.isFinite(date.valueOf()) && date.toISOString().slice(0, 10) === expanded;
}, 'Invalid calendar date');
export const sourceSchema = z.object({
  id, title: z.string().min(1), url: z.url().refine((v) => v.startsWith('https://')),
  publisher: z.string().min(1), accessed: z.iso.datetime(),
  supports: z.string().min(1), rights: z.literal('metadata-only'),
}).strict();
export const eventSchema = z.object({
  id, title: z.string().min(1), date: dateValue,
  stage: z.enum(['research', 'preview', 'availability', 'adoption', 'governance', 'practice']).optional(),
  aliases: z.array(z.string().min(1)).optional(),
  precision: z.enum(['year', 'month', 'day']),
  category: z.enum(['research', 'models', 'products', 'infrastructure', 'governance', 'science']),
  organizations: z.array(z.string()).min(1), sources: z.array(id).min(1),
  summary: z.string().min(1), significance: z.string().min(1),
  related: z.array(id), verification: z.literal('source-checked'),
}).strict().refine((v) => v.date.length === ({year: 4, month: 7, day: 10})[v.precision], 'Date precision mismatch');
export const timelineSchema = z.object({
  id, title: z.string(), subtitle: z.string(), description: z.string(),
  entries: z.array(z.object({event: id, reason: z.string().min(1)}).strict()),
}).strict();
export const approvalSchema = z.object({event:id, hash:z.string().regex(/^[a-f0-9]{64}$/), reviewer:z.string(), reviewedAt:z.iso.datetime(), decision:z.literal('approved')}).strict();
export const batchSchema = z.object({id:z.string(),research_cutoff:z.iso.datetime(),coverage:z.string(),status:z.string()}).strict();
export function fingerprint(event, sources, timelines) {
  const payload = {
    event,
    sources: sources.filter((s) => event.sources.includes(s.id)).toSorted((a, b) => a.id.localeCompare(b.id)),
    memberships: timelines.flatMap((t) => t.entries.filter((e) => e.event === event.id)
      .map((e) => ({timeline: t.id, ...e}))).toSorted((a, b) => a.timeline.localeCompare(b.timeline)),
  };
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}
export function isApproved(event, sources, timelines, approvals) {
  return approvals.some((a) => a.event === event.id && a.hash === fingerprint(event, sources, timelines)
    && reviewers.includes(a.reviewer) && a.reviewedAt && a.decision === 'approved');
}
