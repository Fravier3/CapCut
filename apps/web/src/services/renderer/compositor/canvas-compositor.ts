import type {FrameDescriptor,TextureUploadDescriptor} from './types';
/** Canvas2D compatibility renderer for Safari/devices without WebGPU. Shader effects are GPU-only. */
export class CanvasCompositor {
 private canvas:HTMLCanvasElement|null=null;
 private textures=new Map<string,CanvasImageSource>();
 ensureInitialized({width,height}:{width:number;height:number}){if(!this.canvas)this.canvas=document.createElement('canvas');if(this.canvas.width!==width)this.canvas.width=width;if(this.canvas.height!==height)this.canvas.height=height;}
 getCanvas(){if(!this.canvas)throw new Error('Canvas no inicializado');return this.canvas;}
 syncTextures(textures:TextureUploadDescriptor[]){this.textures.clear();for(const t of textures){if(t.kind==='external'){this.textures.set(t.id,t.source)}else{const c=new OffscreenCanvas(t.width,t.height);const ctx=c.getContext('2d');if(ctx){t.draw(ctx);this.textures.set(t.id,c)}}}}
 render(frame:FrameDescriptor){const ctx=this.getCanvas().getContext('2d')!;const [r,g,b,a]=frame.clear.color;ctx.clearRect(0,0,frame.width,frame.height);ctx.fillStyle=`rgba(${r*255},${g*255},${b*255},${a})`;ctx.fillRect(0,0,frame.width,frame.height);for(const item of frame.items){if(item.type!=='layer')continue;let source=this.textures.get(item.textureId);if(!source)continue;const t=item.transform;if(item.mask){const mask=this.textures.get(item.mask.textureId);if(mask){const layer=new OffscreenCanvas(Math.max(1,Math.round(t.width)),Math.max(1,Math.round(t.height)));const lc=layer.getContext('2d')!;lc.drawImage(source,0,0,layer.width,layer.height);lc.globalCompositeOperation=item.mask.inverted?'destination-out':'destination-in';lc.drawImage(mask,0,0,layer.width,layer.height);source=layer}}
 ctx.save();ctx.globalAlpha=item.opacity;ctx.globalCompositeOperation=item.blendMode==='normal'?'source-over':item.blendMode as GlobalCompositeOperation;ctx.translate(t.centerX,t.centerY);ctx.rotate(t.rotationDegrees*Math.PI/180);ctx.scale(t.flipX?-1:1,t.flipY?-1:1);ctx.drawImage(source,-t.width/2,-t.height/2,t.width,t.height);ctx.restore();}}
}
