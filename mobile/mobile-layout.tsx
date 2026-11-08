import {useState,useEffect} from 'react';
import {useEditor} from '@/editor/use-editor';
import {PreviewPanel} from '@/preview/components';
import {Timeline} from '@/timeline/components';
import {AssetsPanel} from '@/components/editor/panels/assets';
import {PropertiesPanel} from '@/components/editor/panels/properties';
import {useAssetsPanelStore} from '@/components/editor/panels/assets/assets-panel-store';
import {Film,SlidersHorizontal,Layers,Type,Music,Sticker,Sparkles,Settings,X,ArrowRightLeft,Grid2X2} from 'lucide-react';
const tools=[['timeline','Editar',Layers],['media','Medios',Film],['sounds','Audio',Music],['text','Texto',Type],['transitions','Transiciones',ArrowRightLeft],['stickers','Stickers',Sticker],['effects','Efectos',Sparkles],['properties','Ajustes',SlidersHorizontal],['settings','Formato',Settings]] as const;
const primary=new Set(['timeline','media','sounds','text','transitions']);
export function MobileLayout(props:any){
 const [tab,setTab]=useState<string>(()=>useAssetsPanelStore.getState().activeTab);
 const [more,setMore]=useState(false);
 const selected=useEditor(e=>e.selection.getSelectedElements());
 const selectionKey=selected.map(s=>s.elementId).join('|');
 useEffect(()=>{if(selected.length)setTab('timeline')},[selectionKey]);
 const setActive=useAssetsPanelStore(s=>s.setActiveTab);
 const choose=(id:string)=>{if(id!=='timeline'&&id!=='properties')setActive(id as any);setTab(id);setMore(false)};
 return <div className={'mobile-editor '+(tab!=='timeline'?'has-tools':'')}>
  <section className="mobile-preview"><PreviewPanel {...props}/></section>
  <section className="mobile-montage" aria-label="Línea de tiempo"><Timeline/></section>
  {tab!=='timeline'&&<section className="mobile-workspace" aria-label="Herramientas del editor"><div className="tool-caption"><strong>{tools.find(t=>t[0]===tab)?.[1]}</strong><button onClick={()=>setTab('timeline')} aria-label="Cerrar herramientas"><X size={18}/></button></div><div className="tool-content">{tab==='properties'?<PropertiesPanel/>:<AssetsPanel/>}</div></section>}
  <nav className="mobile-tabs mobile-tabs-primary" aria-label="Herramientas">
   {tools.filter(t=>primary.has(t[0])).map(([id,label,Icon])=><button key={id} aria-pressed={tab===id} onClick={()=>choose(id)}><Icon size={21}/><span>{label}</span></button>)}
   <button aria-label="Más herramientas" aria-pressed={!primary.has(tab)} onClick={()=>setMore(true)}><Grid2X2 size={21}/><span>Más</span></button>
  </nav>
  {more&&<div className="home-modal-backdrop"><section className="home-modal" role="dialog" aria-modal="true" aria-label="Más herramientas"><button className="modal-close" aria-label="Cerrar más herramientas" onClick={()=>setMore(false)}><X/></button><h2>Más herramientas</h2>{tools.filter(t=>!primary.has(t[0])).map(([id,label,Icon])=><button key={id} onClick={()=>choose(id)}><Icon size={22}/>{label}</button>)}</section></div>}
 </div>;
}
