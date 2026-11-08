import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
const temp=await mkdtemp(join(tmpdir(),'capcut-touch-'));
try{
 await build({entryPoints:['touch.ts','../apps/web/src/timeline/components/track-navigation.ts'],outdir:temp,bundle:true,platform:'node',format:'esm',outExtension:{'.js':'.mjs'}});
 const {revealTrackTop}=await import(pathToFileURL(join(temp,'apps/web/src/timeline/components/track-navigation.mjs')));
 const {installTimelineTouch}=await import(pathToFileURL(join(temp,'mobile/touch.mjs')));
 assert.equal(revealTrackTop({top:1250,height:80,scrollTop:0,viewportHeight:120,maxScrollTop:1400}),1210);
 assert.equal(revealTrackTop({top:12,height:80,scrollTop:1250,viewportHeight:120,maxScrollTop:1400}),12);
 assert.equal(revealTrackTop({top:50,height:80,scrollTop:20,viewportHeight:150,maxScrollTop:1400}),20);
 console.log('PASS: track reveal reaches tracks beyond 800px and preserves visible rows');
 const listeners={},events=[];let menu=false;
 globalThis.window={dispatchEvent:e=>events.push(e.type)};
 globalThis.MouseEvent=class {constructor(type,init){this.type=type;Object.assign(this,init)}};
 globalThis.document={addEventListener:(type,fn)=>listeners[type]=fn,querySelector:()=>menu?{}:null};
 const target={closest:q=>q==='[data-touch-editable]'?{getAttribute:()=> 'clip'}:{},dispatchEvent:e=>events.push(e.type)};
 const event=(x,y)=>({target,touches:[{clientX:x,clientY:y}],preventDefault(){this.prevented=true}});
 installTimelineTouch();
 listeners.touchstart(event(20,20));const vertical=event(21,50);listeners.touchmove(vertical);listeners.touchend(event(21,50));assert.deepEqual(events,[]);assert.ok(!vertical.prevented);
 console.log('PASS: vertical swipe on a clip stays native scroll without moving the clip');
 listeners.touchstart(event(20,20));const horizontal=event(50,21);listeners.touchmove(horizontal);listeners.touchend(event(50,21));assert.deepEqual(events,['mousedown','mousemove','mouseup']);assert.equal(horizontal.prevented,true);
 events.length=0;listeners.touchstart(event(20,20));listeners.touchend(event(20,20));assert.deepEqual(events,['mousedown','mouseup','click']);
 events.length=0;listeners.touchstart(event(20,20));menu=true;listeners.touchend(event(20,20));assert.deepEqual(events,[]);
 console.log('PASS: horizontal clip dragging and tap selection work; open menu suppresses ghost taps');
}finally{await rm(temp,{recursive:true,force:true})}
