import test from 'node:test';
import assert from 'node:assert/strict';
import { parseFeed, applySuccess, applyFailure } from '../automation/collectors/normalize.mjs';
import { collect, emptyState, fetchFeed } from '../automation/collectors/feeds.mjs';
const feed={id:'test',url:'https://example.com/rss',hosts:['example.com'],publisher:'Example'};
const xml='<rss><channel><item><title>New model</title><link>https://example.com/model?utm_source=rss</link><pubDate>21 Sep 2026 00:00:00 GMT</pubDate></item></channel></rss>';
test('RSS URL normalization deduplicates repeated collection without changing discovery time', () => {
  const entries=parseFeed(xml,feed);
  assert.equal(entries[0].url,'https://example.com/model');
  const first=applySuccess(emptyState(),feed,entries,'2026-09-21T01:00:00Z');
  const second=applySuccess(first,feed,entries,'2026-09-21T02:00:00Z');
  assert.equal(Object.keys(second.candidates).length,1);
  assert.deepEqual(second.candidates,first.candidates);
  assert.equal(Object.keys(first.candidates).length,1);
});
test('revised title preserves earlier evidence', () => {
  const first=applySuccess(emptyState(),feed,parseFeed(xml,feed),'2026-09-21T01:00:00Z');
  const second=applySuccess(first,feed,parseFeed(xml.replace('New model','Revised model'),feed),'2026-09-21T02:00:00Z');
  assert.equal(Object.values(second.candidates)[0].revisions[0].title,'New model');
  assert.equal(Object.values(first.candidates)[0].title,'New model');
});
test('failed source does not advance its last successful watermark or erase candidates', async () => {
  const first=applySuccess(emptyState(),feed,parseFeed(xml,feed),'2026-09-21T01:00:00Z');
  const second=applyFailure(first,feed,'HTTP 503','2026-09-21T02:00:00Z');
  assert.equal(second.feeds.test.lastSuccess,first.feeds.test.lastSuccess);
  assert.deepEqual(second.candidates,first.candidates);
  const actual=await collect(first,[feed],async()=>new Response('unavailable',{status:503}));
  assert.equal(actual.feeds.test.lastSuccess,first.feeds.test.lastSuccess);
  assert.equal(actual.feeds.test.error,'HTTP 503');
});
test('malformed XML, entities and unexpected hosts are rejected', () => {
  assert.throws(()=>parseFeed('<rss>',feed));
  assert.throws(()=>parseFeed('<!DOCTYPE rss>'+xml,feed));
  assert.throws(()=>parseFeed(xml.replace('https://example.com/model','https://evil.example/model'),feed));
});
test('Atom works and oversized responses stop before parsing', async () => {
  const atom='<feed><entry><title>Paper</title><link href="https://example.com/paper"/><published>2026-09-20T00:00:00Z</published></entry></feed>';
  assert.equal(parseFeed(atom,feed)[0].title,'Paper');
  await assert.rejects(()=>fetchFeed(feed,async()=>new Response(xml,{headers:{'content-length':'6000000'}})),/size limit/);
});
