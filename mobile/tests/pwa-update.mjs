import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import vm from 'node:vm';
const source=await readFile('dist/sw.js','utf8');
const handlers={},removed=[],lookups=[];
let online=false;
const current={match:async key=>{const path=typeof key==='string'?key:new URL(key.url).pathname;lookups.push(path);return path==='/CapCut/index.html'?'CURRENT_HTML':path==='/CapCut/icons/logo.svg'?'CURRENT_ICON':undefined},addAll:async()=>{}};
vm.runInNewContext(source,{self:{addEventListener:(name,fn)=>handlers[name]=fn,clients:{matchAll:async()=>[{}],claim:async()=>{}},skipWaiting(){}},caches:{open:async()=>current,match:async()=> 'OLD_HASHED_ASSET',keys:async()=>['capcut-fj-old1','capcut-fj-old2','capcut-fj-old3'],delete:async key=>removed.push(key)},location:{origin:'https://example.test'},URL,fetch:async()=>{if(!online)throw Error('offline');return 'NETWORK'}});
async function request(path,mode){let response;handlers.fetch({request:{url:'https://example.test'+path,method:'GET',mode},respondWith:p=>response=p});return await response}
assert.equal(await request('/CapCut/','navigate'),'CURRENT_HTML');
assert.equal(await request('/CapCut/icons/logo.svg','cors'),'CURRENT_ICON');
assert.equal(await request('/CapCut/assets/previous.js','cors'),'OLD_HASHED_ASSET');
let activation;handlers.activate({waitUntil:p=>activation=p});await activation;assert.deepEqual(removed,['capcut-fj-old1']);
await assert.rejects(access('dist/qa.html'));
console.log('PASS: offline uses current HTML/icons; old hashed assets remain available; two previous caches retained; QA frame excluded');
