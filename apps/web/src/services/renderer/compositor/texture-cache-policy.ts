import type {ExternalTextureDescriptor} from './types';
export function canReuseExternalTexture(previous:{kind:string;source?:CanvasImageSource;width:number;height:number}|undefined,next:ExternalTextureDescriptor):boolean{
 const immutable=(typeof HTMLImageElement!=='undefined'&&next.source instanceof HTMLImageElement)||(typeof ImageBitmap!=='undefined'&&next.source instanceof ImageBitmap);
 return !!immutable&&previous?.kind==='external'&&previous.source===next.source&&previous.width===next.width&&previous.height===next.height;
}
