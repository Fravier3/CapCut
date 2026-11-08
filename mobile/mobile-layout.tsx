import {useState} from 'react';
import {PreviewPanel} from '@/preview/components';
import {Timeline} from '@/timeline/components';
import {AssetsPanel} from '@/components/editor/panels/assets';
import {PropertiesPanel} from '@/components/editor/panels/properties';
import {useAssetsPanelStore} from '@/components/editor/panels/assets/assets-panel-store';
import {Film,SlidersHorizontal,Layers,Type,Music,Sticker,Sparkles,Settings,X} from 'lucide-react';
const tools=[['timeline','Editar',Layers],['media','Medios',Film],['sounds','Audio',Music],['text','Texto',Type],['stickers','Stickers',Sticker],['effects','Efectos',Sparkles],['properties','Ajustes',SlidersHorizontal],['settings','Formato',Settings]] as const;
export function MobileLayout(props:any){const [tab,setTab]=useState<string>(()=>useAssetsPanelStore.getState().activeTab);const setActive=useAssetsPanelStore(s=>s.setActiveTab);return <div className={'mobile-editor '+(tab!=='timeline'?'has-tools':'')}><section className="mobile-preview"><PreviewPanel {...props}/></section><section className="mobile-montage" aria-label="Línea de tiempo"><Timeline/></section>{tab!=='timeline'&&<section className="mobile-workspace" aria-label="Herramientas del editor"><div className="tool-caption"><strong>{tools.find(t=>t[0]===tab)?.[1]}</strong><button onClick={()=>setTab('timeline')} aria-label="Cerrar herramientas"><X size={18}/></button></div><div className="tool-content">{tab==='properties'?<PropertiesPanel/>:<AssetsPanel/>}</div></section>}<nav className="mobile-tabs" aria-label="Herramientas">{tools.map(([id,label,Icon])=><button key={id} aria-pressed={tab===id} onClick={()=>{if(id!=='timeline'&&id!=='properties')setActive(id);setTab(id)}}><Icon size={21}/><span>{label}</span></button>)}</nav></div>}
