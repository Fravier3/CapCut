import React from 'react';
export default function Image({src,fill,priority,quality,sizes,unoptimized,style,...props}:any){return <img {...props} src={typeof src==='string'&&src.startsWith('/')&&!src.startsWith(import.meta.env.BASE_URL)?import.meta.env.BASE_URL+src.slice(1):src} style={{...(fill?{position:'absolute',width:'100%',height:'100%',inset:0}:{}),...style}}/>}
