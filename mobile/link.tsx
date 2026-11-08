import React from 'react';
export default function Link({href,prefetch,replace,...props}:any){return <a {...props} href={href.startsWith('/')?'#'+href:href}/>}
