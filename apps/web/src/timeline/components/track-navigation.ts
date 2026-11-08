export function revealTrackTop({top,height,scrollTop,viewportHeight,maxScrollTop}:{top:number;height:number;scrollTop:number;viewportHeight:number;maxScrollTop:number}){
 let next=scrollTop;
 if(top<scrollTop)next=top;
 else if(top+height>scrollTop+viewportHeight)next=height>=viewportHeight?top:top+height-viewportHeight;
 return Math.max(0,Math.min(maxScrollTop,next));
}
