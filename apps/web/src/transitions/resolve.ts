export type ClipTransition = { type: 'fade' | 'slide' | 'zoom'; duration: number };
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const ease=(v:number)=>{const x=clamp(v);return x*x*(3-2*x)};
export function resolveClipTransition({entry,exit,time,duration,width}:{entry?:ClipTransition;exit?:ClipTransition;time:number;duration:number;width:number}){
 let opacity=1,x=0,scale=1;
 const apply=(effect:ClipTransition,amount:number,incoming:boolean)=>{
  const progress=ease(amount);opacity*=progress;
  if(effect.type==='slide')x+=(incoming?1:-1)*(1-progress)*width;
  if(effect.type==='zoom')scale*=1+(1-progress)*(incoming ? .18 : -.18);
 };
 if(entry && entry.duration>0 && duration>0)apply(entry,time/Math.min(entry.duration,duration/2),true);
 if(exit && exit.duration>0 && duration>0)apply(exit,(duration-time)/Math.min(exit.duration,duration/2),false);
 return {opacity,x,scale};
}
