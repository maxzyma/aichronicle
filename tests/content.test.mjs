import test from 'node:test';
import assert from 'node:assert/strict';
import { loadContent } from '../automation/checks/content.mjs';
import { dateValue, eventSchema, fingerprint, isApproved, approvalSchema } from '../automation/checks/model.mjs';
const data = loadContent();
const event = data.events.find((e) => e.id === 'react');
const approval = {event:event.id,hash:fingerprint(event,data.sources,data.timelines),reviewer:'maxzyma',reviewedAt:'2026-09-21T00:00:00Z',decision:'approved'};
test('calendar precision never invents an invalid date', () => {
  assert.equal(dateValue.safeParse('2025-02-29').success,false);
  assert.equal(dateValue.safeParse('2024-02-29').success,true);
  assert.equal(dateValue.safeParse('2025-13').success,false);
  assert.equal(dateValue.safeParse('2025').success,true);
  const {body,...record} = event;
  assert.equal(eventSchema.safeParse({...record,precision:'day'}).success,false);
});
test('only an authorized human approval of this exact content publishes', () => {
  assert.equal(isApproved(event,data.sources,data.timelines,[]),false);
  assert.equal(isApproved(event,data.sources,data.timelines,[approval]),true);
  assert.equal(isApproved(event,data.sources,data.timelines,[{...approval,reviewer:'robot'}]),false);
  assert.equal(approvalSchema.safeParse({...approval,reviewedAt:'yesterday'}).success,false);
});
test('fact, body, source and membership changes invalidate approval', () => {
  assert.equal(isApproved({...event,summary:'changed'},data.sources,data.timelines,[approval]),false);
  assert.equal(isApproved({...event,body:'changed'},data.sources,data.timelines,[approval]),false);
  const sources=data.sources.map((s)=>event.sources.includes(s.id)?{...s,url:'https://example.com/revised'}:s);
  assert.equal(isApproved(event,sources,data.timelines,[approval]),false);
  const timelines=data.timelines.map((t)=>({...t,entries:t.entries.map((e)=>e.event===event.id?{...e,reason:'changed'}:e)}));
  assert.equal(isApproved(event,data.sources,timelines,[approval]),false);
});
test('dataset has a source and timeline for each event', () => {
  assert.ok(data.events.length>0);
  for (const e of data.events) {
    assert.ok(e.sources.every((id)=>data.sources.some((s)=>s.id===id)));
    assert.ok(data.timelines.some((t)=>t.entries.some((m)=>m.event===e.id)));
  }
});
