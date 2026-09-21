import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeDiscovery,fetchDiscovery,publicUrl} from '../automation/collectors/discovery.mjs';
import {applySuccess} from '../automation/collectors/normalize.mjs';
import {collect,emptyState} from '../automation/collectors/feeds.mjs';
const hn={id:'hn',kind:'hn',query:'model',windowDays:7,maxPages:2,perPage:2,publisher:'HN',url:'https://hn.algolia.com/'};
const github={...hn,id:'github',kind:'github',query:'topic:ai-agent',dateField:'pushed',publisher:'GitHub'};
const hit={objectID:'123',title:'A new decision model',url:'https://example.com/model',created_at:'2026-09-20T00:00:00Z',points:10};
test('discovery never turns community discussion into publisher evidence',()=>{
  const [entry]=normalizeDiscovery({hits:[hit],nbPages:1},hn);
  assert.equal(entry.evidence,'discovery-only');
  assert.equal(entry.discoveryUrl,'https://news.ycombinator.com/item?id=123');
  const first=applySuccess(emptyState(),hn,[entry],'2026-09-21T00:00:00Z');
  const publisher={...entry,feed:'official',publisher:'Publisher',evidence:'publisher-feed',publishedAt:'2026-09-15T00:00:00Z'};
  const second=applySuccess(first,{id:'official',url:'https://example.com/rss'},[publisher],'2026-09-21T01:00:00Z');
  const third=applySuccess(second,hn,[entry],'2026-09-21T02:00:00Z');
  assert.equal(Object.keys(third.candidates).length,1);
  assert.equal(third.candidates[entry.id].evidence,'publisher-feed');
  assert.equal(third.candidates[entry.id].publishedAt,publisher.publishedAt);
  assert.equal(third.candidates[entry.id].channels.length,2);
});
test('unsafe links fall back to HN discussion; arbitrary IP targets are rejected',()=>{
  const [entry]=normalizeDiscovery({hits:[{...hit,url:'http://127.0.0.1/'}],nbPages:1},hn);
  assert.equal(entry.url,'https://news.ycombinator.com/item?id=123');
  assert.throws(()=>publicUrl('https://127.0.0.1/'));
  assert.throws(()=>publicUrl('https://user:secret@example.com/'));
});
test('repository creation time is not used as launch date and private repos are excluded',()=>{
  const entries=normalizeDiscovery({total_count:2,items:[
    {private:false,html_url:'https://github.com/team/agent',full_name:'team/agent',created_at:'2020-01-01T00:00:00Z',stargazers_count:100},
    {private:true,html_url:'https://github.com/team/private',full_name:'team/private'},
  ]},github);
  assert.equal(entries.length,1);
  assert.equal(entries[0].publishedAt,null);
  assert.equal(entries[0].projectCreatedAt,'2020-01-01T00:00:00Z');
});
test('bounded discovery paginates and reports its coverage limit',async()=>{
  const calls=[];
  const result=await fetchDiscovery(hn,async(url)=>{
    calls.push(new URL(url));
    return new Response(JSON.stringify({hits:[hit],nbPages:4}));
  });
  assert.equal(calls.length,2);
  assert.equal(calls[1].searchParams.get('page'),'1');
  assert.equal(result.coverage.capped,true);
});
test('partial-page failure retains prior successful state',async()=>{
  const initial={...emptyState(),feeds:{hn:{lastSuccess:'2026-09-19T00:00:00Z'}}};
  let call=0;
  const state=await collect(initial,[hn],async()=>{
    call+=1;
    return call===1?new Response(JSON.stringify({hits:[hit],nbPages:2})):new Response('',{status:503});
  });
  assert.equal(state.feeds.hn.lastSuccess,initial.feeds.hn.lastSuccess);
  assert.equal(Object.keys(state.candidates).length,0);
  assert.equal(state.feeds.hn.error,'HTTP 503');
});
test('GitHub search explicitly restricts results to public repositories',async()=>{
  let requested='';
  await fetchDiscovery(github,async(url)=>{requested=url;return new Response(JSON.stringify({items:[],total_count:0}));});
  assert.match(new URL(requested).searchParams.get('q'),/is:public/);
  assert.equal(new URL(requested).hostname,'api.github.com');
});
