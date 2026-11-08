import { useState } from 'react';
import { Scissors, Crop, MoveHorizontal, Trash2, Undo2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useEditor } from '@/editor/use-editor';
import { useElementSelection } from '@/timeline/hooks/element/use-element-selection';
import { mediaTimeFromSeconds, mediaTimeToSeconds } from '@/wasm';
import { buildMoveGroup, resolveGroupMove } from '@/timeline/group-move';

export function MobileTimelineToolbar(){
 const editor=useEditor();
 const {selectedElements}=useElementSelection();
 const currentTime=useEditor(e=>e.playback.getCurrentTime());
 const scene=useEditor(e=>e.scenes.getActiveSceneOrNull());
 const selected=selectedElements.length===1?editor.timeline.getElementsWithTracks({elements:selectedElements})[0]:null;
 const [dialog,setDialog]=useState<'trim'|'move'|null>(null),[position,setPosition]=useState('0');
 const start=selected?mediaTimeToSeconds({time:selected.element.startTime}):0;
 const duration=selected?mediaTimeToSeconds({time:selected.element.duration}):0;
 const cursor=mediaTimeToSeconds({time:currentTime});
 const split=(retainSide:'both'|'left'|'right')=>{
  if(!selected)return;
  if(cursor<=start||cursor>=start+duration){toast('Mueve el cursor azul dentro del clip para cortar.');return}
  editor.timeline.splitElements({elements:selectedElements,splitTime:currentTime,retainSide});setDialog(null);
 };
 const move=()=>{
  if(!selected||!scene)return;
  const seconds=Number(position);
  if(!Number.isFinite(seconds)||seconds<0){toast.error('Escribe una posición válida en segundos.');return}
  const group=buildMoveGroup({anchorRef:selectedElements[0],selectedElements,tracks:scene.tracks});if(!group)return;
  const plan=resolveGroupMove({allowMainTrackGap:true,group,tracks:scene.tracks,anchorStartTime:mediaTimeFromSeconds({seconds}),target:{kind:'existingTrack',anchorTargetTrackId:selectedElements[0].trackId}});
  if(!plan){toast('Ese espacio está ocupado en esta pista. Elige otra posición.');return}
  editor.timeline.moveElements({moves:plan.moves,createTracks:plan.createTracks});setDialog(null);
 };
 const openTrim=()=>{if(!selected)return;if(cursor<=start||cursor>=start+duration)editor.playback.seek({time:mediaTimeFromSeconds({seconds:start+duration/2})});setDialog('trim')};
 return <>
  <div className="mobile-clip-toolbar"><div className="mobile-clip-actions" aria-label="Editar clip">
   <button disabled={!selected} onClick={()=>split('both')}><Scissors/><span>Dividir</span></button>
   <button disabled={!selected} onClick={openTrim}><Crop/><span>Recortar</span></button>
   <button disabled={!selected} onClick={()=>{setPosition(start.toFixed(2));setDialog('move')}}><MoveHorizontal/><span>Mover</span></button>
   <button disabled={!selectedElements.length} onClick={()=>editor.timeline.deleteElements({elements:selectedElements})}><Trash2/><span>Eliminar</span></button>
   <button disabled={!editor.command.canUndo()} onClick={()=>editor.command.undo()}><Undo2/><span>Deshacer</span></button>
  </div><p>{selected?'Desliza el clip ↔ para mover · Arrastra sus extremos para recortar':'Toca un clip para editar · Desliza ↑↓ para cambiar de pista'}</p></div>
  {dialog&&selected&&<div className="home-modal-backdrop"><section className="home-modal mobile-edit-dialog" role="dialog" aria-modal="true" aria-label={dialog==='trim'?'Recortar clip':'Mover clip'}>
   <button className="modal-close" aria-label="Cerrar edición" onClick={()=>setDialog(null)}><X/></button>
   <h2>{dialog==='trim'?'Recortar clip':'Mover clip'}</h2>
   {dialog==='trim'?<>
    <p>Coloca el punto de corte y elige qué parte conservar. También puedes arrastrar los extremos del clip.</p>
    <label>Punto de corte: {cursor.toFixed(2)} s<input aria-label="Punto de corte" type="range" min={start} max={start+duration} step="0.01" value={Math.max(start,Math.min(start+duration,cursor))} onChange={e=>editor.playback.seek({time:mediaTimeFromSeconds({seconds:Number(e.target.value)})})}/></label>
    <button onClick={()=>split('right')}>Eliminar lo que queda antes</button><button onClick={()=>split('left')}>Eliminar lo que queda después</button><button onClick={()=>split('both')}>Dividir en dos clips</button>
   </>:<>
    <p>Arrastra el clip horizontalmente o indica cuándo debe comenzar.</p>
    <label>Inicio en segundos<input aria-label="Inicio del clip en segundos" type="number" inputMode="decimal" min="0" step="0.1" value={position} onChange={e=>setPosition(e.target.value)}/></label>
    <div className="move-step-buttons"><button onClick={()=>setPosition(String(Math.max(0,Number(position)-.5)))}>−0.5 s</button><button onClick={()=>setPosition(String(Number(position)+.5))}>+0.5 s</button></div>
    <button onClick={()=>setPosition(cursor.toFixed(2))}>Colocar en el cursor ({cursor.toFixed(2)} s)</button><button onClick={move}>Aplicar posición</button>
   </>}
  </section></div>}
 </>;
}
