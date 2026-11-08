import sharp from 'sharp';
const base=new URL('../../apps/web/public/icons/',import.meta.url);
// Asset master is resolution-independent; leave ample room for OS icon masks.
const svg=new URL('logo.svg',base);
await Promise.all([180,192,512].map(n=>sharp(svg.pathname).resize(n,n).png().toFile(new URL(n===180?'apple-touch-icon.png':`icon-${n}.png`,base).pathname)));
