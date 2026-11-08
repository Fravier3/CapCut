import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
const temp=await mkdtemp(join(tmpdir(),'mobile-regressions-'));
try{
 await build({entryPoints:['../apps/web/src/media/media-utils.ts','../apps/web/src/transitions/resolve.ts','../apps/web/src/services/renderer/compositor/texture-cache-policy.ts'],outdir:temp,bundle:true,platform:'node',format:'esm',outExtension:{'.js':'.mjs'}});
 const {getMediaTypeFromFile}=await import(pathToFileURL(join(temp,'media/media-utils.mjs')));
 for(const name of ['music.mp3','music.M4A','sound.wav','audio.flac'])assert.equal(getMediaTypeFromFile({file:new File(['audio'],name,{type:'application/octet-stream'})}),'audio');
 assert.equal(getMediaTypeFromFile({file:new File(['x'],'photo.jpg',{type:'image/jpeg'})}),'image');
 assert.equal(getMediaTypeFromFile({file:new File(['x'],'unknown.dat')}),null);
 console.log('PASS: MP3/M4A/WAV/FLAC imported from Files work without an audio MIME type');
 const {resolveClipTransition}=await import(pathToFileURL(join(temp,'transitions/resolve.mjs')));
 for(const type of ['fade','slide','zoom']){
  const args={entry:{type,duration:.4},exit:{type,duration:.4},duration:3,width:640};
  assert.equal(resolveClipTransition({...args,time:0}).opacity,0);
  assert.equal(resolveClipTransition({...args,time:1.5}).opacity,1);
  assert.equal(resolveClipTransition({...args,time:3}).opacity,0);
  assert.equal(resolveClipTransition({...args,time:.2}).opacity,.5);
  assert.deepEqual(JSON.parse(JSON.stringify(args)),args);
 }
 assert.equal(resolveClipTransition({entry:{type:'slide',duration:.4},time:0,duration:3,width:640}).x,640);
 console.log('PASS: all transitions resolve at entry/middle/exit and serialize with the project');
 const {canReuseExternalTexture}=await import(pathToFileURL(join(temp,'services/renderer/compositor/texture-cache-policy.mjs')));
 globalThis.HTMLImageElement=class{};
 const canvas={getContext(){}};const dynamic={id:'video',kind:'external',source:canvas,width:640,height:360};
 assert.equal(canReuseExternalTexture(dynamic,dynamic),false);
 const image=new HTMLImageElement();const still={...dynamic,source:image};assert.equal(canReuseExternalTexture(still,still),true);
 console.log('PASS: reusing a decoder canvas never skips uploading changed video pixels');
}finally{await rm(temp,{recursive:true,force:true})}
