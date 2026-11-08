// Clip bodies allow vertical native scrolling. Horizontal movement edits the clip;
// the ruler, playhead and resize handles keep their direct drag behavior.
export function installTimelineTouch(){
 let target:Element|null=null,start:Touch|null=null,last:Touch|null=null,editing=false,moved=false;
 const send=(type:string,t:Touch,dest:EventTarget)=>dest.dispatchEvent(new MouseEvent(type,{bubbles:true,cancelable:true,view:window,clientX:t.clientX,clientY:t.clientY,button:0,buttons:type==='mouseup'?0:1}));
 const reset=()=>{target=null;start=null;last=null;editing=false;moved=false};
 const cancel=()=>{if(editing&&last)send('mouseup',last,window);reset()};
 document.addEventListener('touchstart',e=>{
  if(e.touches.length!==1){cancel();return}
  const el=e.target as Element,handle=el.closest('[data-touch-editable]');
  if(!handle||!el.closest('.mobile-montage'))return;
  target=el;start=last=e.touches[0];moved=false;
  editing=handle.getAttribute('data-touch-editable')!=='clip';
  if(editing){e.preventDefault();send('mousedown',last,target)}
 },{passive:false});
 document.addEventListener('touchmove',e=>{
  if(!target||!start||!e.touches.length)return;
  last=e.touches[0];const dx=last.clientX-start.clientX,dy=last.clientY-start.clientY;
  if(!editing){
   if(Math.hypot(dx,dy)<6)return;
   if(Math.abs(dy)>Math.abs(dx)){reset();return} // Let Safari pan between tracks.
   editing=true;moved=true;send('mousedown',start,target);
  }
  moved ||= Math.hypot(dx,dy)>5;e.preventDefault();send('mousemove',last,window);
 },{passive:false});
 document.addEventListener('touchend',e=>{
  if(!target||!last){reset();return}
  // Radix owns long-press menus; don't synthesize a second tap beneath one.
  if(document.querySelector('[role="menu"][data-state="open"]')){cancel();return}
  e.preventDefault();
  if(!editing)send('mousedown',last,target);
  send('mouseup',last,window);if(!moved)send('click',last,target);reset();
 },{passive:false});
 document.addEventListener('touchcancel',cancel);
}
