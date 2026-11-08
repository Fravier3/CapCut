import {useState} from 'react';
import {toast} from 'sonner';
import {useEditor} from '@/editor/use-editor';
import {useElementSelection} from '@/timeline/hooks/element/use-element-selection';
import {mediaTimeToSeconds} from '@/wasm';
import type {ClipTransition} from './resolve';
export function TransitionsView(){
 const editor=useEditor(),scene=useEditor(e=>e.scenes.getActiveSceneOrNull());
 const {selectedElements}=useElementSelection();
 const clips=scene?[...scene.tracks.overlay,scene.tracks.main].flatMap(track=>track.elements.filter(el=>el.type==='video'||el.type==='image').map(element=>({trackId:track.id,element}))).sort((a,b)=>a.element.startTime-b.element.startTime):[];
 const [chosen,setChosen]=useState(''),[type,setType]=useState<ClipTransition['type']>('fade'),[duration,setDuration]=useState('.4');
 const clip=clips.find(c=>c.element.id===(chosen||selectedElements[0]?.elementId))??clips[0];
 const apply=(where:'in'|'out'|'between'|'none')=>{
  if(!clip)return;
  const seconds=Math.max(.05,Math.min(2,Number(duration)||.4));
  const effect={type,duration:seconds};
  let updates:any[]=[];
  if(where==='none')updates=[{trackId:clip.trackId,elementId:clip.element.id,patch:{transitionIn:undefined,transitionOut:undefined}}];
  else if(where==='between'){
   const next=clips.filter(c=>c.trackId===clip.trackId&&c.element.startTime>=clip.element.startTime+clip.element.duration).sort((a,b)=>a.element.startTime-b.element.startTime)[0];
   if(!next||Math.abs(next.element.startTime-clip.element.startTime-clip.element.duration)>1){toast('Necesitas dos clips consecutivos en la misma pista.');return}
   updates=[{trackId:clip.trackId,elementId:clip.element.id,patch:{transitionOut:effect}},{trackId:next.trackId,elementId:next.element.id,patch:{transitionIn:effect}}];
  }else updates=[{trackId:clip.trackId,elementId:clip.element.id,patch:where==='in'?{transitionIn:effect}:{transitionOut:effect}}];
  editor.timeline.updateElements({updates});toast.success(where==='none'?'Transiciones retiradas':'Transición aplicada');
 };
 return <div className="transition-panel"><h3>Transiciones</h3><p>Suaviza el inicio, el final o el corte entre dos clips. Funcionan en la vista previa y al exportar.</p>
 {!clips.length?<p>Importa un video o una foto para comenzar.</p>:<>
 <label>Clip<select aria-label="Clip de transición" value={clip?.element.id} onChange={e=>setChosen(e.target.value)}>{clips.map((c,i)=><option value={c.element.id} key={c.element.id}>{i+1}. {c.element.name}</option>)}</select></label>
 <div className="transition-presets">{([['fade','Fundido a negro'],['slide','Deslizar'],['zoom','Zoom suave']] as const).map(([id,label])=><button aria-pressed={type===id} key={id} onClick={()=>setType(id)}><span className={'transition-sample sample-'+id}/>{label}</button>)}</div>
 <label>Duración: {duration} s<input aria-label="Duración de transición" type="range" min=".1" max="1.5" step=".05" value={duration} onChange={e=>setDuration(e.target.value)}/></label>
 <div className="transition-actions"><button onClick={()=>apply('in')}>Al inicio</button><button onClick={()=>apply('out')}>Al final</button><button onClick={()=>apply('between')}>Entre este y el siguiente</button><button onClick={()=>apply('none')}>Quitar transición</button></div>
 <p>Clip: {mediaTimeToSeconds({time:clip.element.duration}).toFixed(2)} s. El fundido pasa por negro; no cambia la duración del montaje.</p>
 </>}
 </div>;
}
