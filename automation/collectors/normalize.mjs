import { createHash } from 'node:crypto';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
const list = (value) => value === undefined ? [] : Array.isArray(value) ? value : [value];
const text = (value) => typeof value === 'object' && value !== null ? String(value['#text'] ?? '') : String(value ?? '');
export function canonicalUrl(value, feed) {
  const url = new URL(value, feed.url);
  if (url.protocol !== 'https:' || !feed.hosts.includes(url.hostname) || url.username || url.password) throw new Error('Unexpected source URL');
  const keys = Array.from(url.searchParams.keys());
  for (const key of keys) if (/^utm_|^(fbclid|gclid)$/.test(key)) url.searchParams.delete(key);
  url.hash = '';
  return url.href;
}
export function parseFeed(xml, feed) {
  if (/<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error('XML entities are not accepted');
  if (XMLValidator.validate(xml) !== true) throw new Error('Invalid XML');
  const parsed = new XMLParser({ignoreAttributes:false, processEntities:false}).parse(xml);
  if (!parsed.rss?.channel && !parsed.feed) throw new Error('Expected RSS or Atom feed');
  return list(parsed.rss?.channel?.item ?? parsed.feed?.entry).map((item) => {
    const link = typeof item.link === 'string' ? item.link : list(item.link).find((l) => !l['@_rel'] || l['@_rel'] === 'alternate')?.['@_href'];
    if (!link || !text(item.title).trim()) throw new Error('Feed entry is missing title or link');
    const url = canonicalUrl(link, feed);
    const title = text(item.title).replace(/<[^>]*>/g, '').trim().slice(0, 500);
    const date = text(item.pubDate ?? item.published ?? item.updated);
    if (date && !Number.isFinite(Date.parse(date))) throw new Error('Feed entry has invalid date');
    return {id:createHash('sha256').update(url).digest('hex').slice(0,24),url,title,
      publishedAt: date ? new Date(date).toISOString() : null, feed:feed.id, publisher:feed.publisher};
  });
}
export function applySuccess(state, feed, entries, now) {
  const candidates = entries.reduce((current, entry) => {
    const previous = current[entry.id];
    const changed = previous && (previous.title !== entry.title || previous.publishedAt !== entry.publishedAt);
    return {...current, [entry.id]: {...previous, ...entry, status:previous?.status ?? 'candidate',
      discoveredAt:previous?.discoveredAt ?? now, updatedAt:changed ? now : previous?.updatedAt ?? now,
      revisions: changed ? [...(previous.revisions ?? []), {title:previous.title,publishedAt:previous.publishedAt,at:now}] : previous?.revisions ?? []}};
  }, state.candidates);
  return {...state, candidates, feeds:{...state.feeds,[feed.id]:{lastAttempt:now,lastSuccess:now,error:null,items:entries.length}}};
}
export function applyFailure(state, feed, error, now) {
  return {...state,feeds:{...state.feeds,[feed.id]:{...state.feeds[feed.id],lastAttempt:now,error:String(error).slice(0,500)}}};
}
