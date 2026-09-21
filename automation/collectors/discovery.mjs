import { createHash } from 'node:crypto';
import { isIP } from 'node:net';
import { z } from 'zod';
import { fetchText } from './http.mjs';
export const discoverySchema = z.object({
  id:z.string().regex(/^[a-z0-9-]+$/), kind:z.enum(['hn','github']), query:z.string().min(1),
  dateField:z.enum(['created','pushed']).optional(),windowDays:z.number().int().min(1).max(90),
  maxPages:z.number().int().min(1).max(5),perPage:z.number().int().min(1).max(100),
  publisher:z.string(),url:z.url(),
}).strict();
export function publicUrl(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.port
    || isIP(url.hostname) || !url.hostname.includes('.') || /\.(local|internal|localhost)$/.test(url.hostname)) {
    throw new Error('Not a public HTTPS candidate URL');
  }
  for (const key of Array.from(url.searchParams.keys())) if (/^utm_|^(fbclid|gclid)$/.test(key)) url.searchParams.delete(key);
  url.hash = '';
  return url.href;
}
function candidate(url, title, source, extra) {
  const canonical = publicUrl(url);
  return {id:createHash('sha256').update(canonical).digest('hex').slice(0,24),url:canonical,
    title:String(title).replace(/<[^>]*>/g,'').trim().slice(0,500),feed:source.id,publisher:source.publisher,
    evidence:'discovery-only',publishedAt:null,...extra};
}
export function normalizeDiscovery(payload, source) {
  if (source.kind === 'github') {
    if (!Array.isArray(payload.items) || !Number.isInteger(payload.total_count)) throw new Error('Invalid GitHub search response');
    return payload.items.filter((item) => item.private === false && item.visibility !== 'private').map((item) => {
      if (!item.full_name || !item.html_url?.startsWith('https://github.com/')) throw new Error('Invalid public repository record');
      return candidate(item.html_url,item.full_name,source,{projectCreatedAt:item.created_at,
        discoveryUrl:item.html_url,signal:{stars:item.stargazers_count},publishedAt:null});
    });
  }
  if (!Array.isArray(payload.hits) || !Number.isInteger(payload.nbPages)) throw new Error('Invalid HN response');
  return payload.hits.filter((item) => item.title && /^\d+$/.test(item.objectID)).map((item) => {
    const discussion = `https://news.ycombinator.com/item?id=${item.objectID}`;
    let target;
    try { target=publicUrl(item.url); } catch { target=discussion; }
    if (!Number.isFinite(Date.parse(item.created_at))) throw new Error('Invalid HN date');
    return candidate(target,item.title,source,{publishedAt:new Date(item.created_at).toISOString(),
      discoveryUrl:discussion,signal:{points:item.points,comments:item.num_comments}});
  });
}
function endpoint(source, page, now) {
  const since = new Date(now - source.windowDays * 86400000);
  const url = new URL(source.kind === 'github' ? 'https://api.github.com/search/repositories' : 'https://hn.algolia.com/api/v1/search_by_date');
  const parameters = source.kind === 'github' ? {
    q:`${source.query} is:public fork:false archived:false ${source.dateField ?? 'created'}:>=${since.toISOString().slice(0,10)}`,
    sort:'stars',order:'desc',per_page:String(source.perPage),page:String(page+1),
  } : {query:source.query,tags:'story',numericFilters:`created_at_i>${Math.floor(since.valueOf()/1000)}`,
    hitsPerPage:String(source.perPage),page:String(page)};
  for (const [key,value] of Object.entries(parameters)) url.searchParams.set(key,value);
  return url.href;
}
export async function fetchDiscovery(source, fetcher=fetch, now=Date.now()) {
  let entries=[];
  let reportedPages=0;
  let incomplete=false;
  for (let page=0;page<source.maxPages;page+=1) {
    const headers=source.kind==='github' && process.env.GITHUB_TOKEN ? {Authorization:`Bearer ${process.env.GITHUB_TOKEN}`} : {};
    const payload=JSON.parse(await fetchText(endpoint(source,page,now),fetcher,headers));
    const items=normalizeDiscovery(payload,source);
    entries=[...entries,...items];
    reportedPages=source.kind==='github' ? Math.ceil(payload.total_count/source.perPage) : payload.nbPages;
    incomplete=incomplete || Boolean(payload.incomplete_results);
    if (page+1>=reportedPages) break;
  }
  return {entries,coverage:{windowDays:source.windowDays,capped:reportedPages>source.maxPages || incomplete,
    reportedPages,pageLimit:source.maxPages,order:source.kind==='github'?'total-stars':'newest'}};
}
