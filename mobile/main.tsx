import {registerUpdates} from './pwa';
import {installTimelineTouch} from './touch';
import React,{Suspense,lazy} from 'react';
import {createRoot} from 'react-dom/client';
import {ThemeProvider} from 'next-themes';
import {TooltipProvider} from '@/components/ui/tooltip';
import {Toaster} from '@/components/ui/sonner';
import {usePathname} from './navigation';
import '@/app/globals.css';import './mobile.css';
const Projects=lazy(()=>import('./home'));
const Editor=lazy(()=>import('@/app/editor/[project_id]/page'));
class ErrorBoundary extends React.Component<any,{error:string}>{state={error:''};static getDerivedStateFromError(e:any){return {error:e.message}}render(){return this.state.error?<main className="fatal"><h1>No se pudo abrir el editor</h1><p>{this.state.error}</p><button onClick={()=>location.reload()}>Intentar de nuevo</button></main>:this.props.children}}
function App(){const path=usePathname();return <ErrorBoundary><ThemeProvider attribute="class" defaultTheme="dark"><TooltipProvider><Toaster/><Suspense fallback={<div className="boot">Preparando CapCut FJ…</div>}>{path.startsWith('/editor/')?<Editor/>:<Projects/>}</Suspense></TooltipProvider></ThemeProvider></ErrorBoundary>}
if(import.meta.env.DEV&&new URLSearchParams(location.search).has('qaInsets')){const style=document.documentElement.style;style.setProperty('--safe-top','59px');style.setProperty('--safe-bottom','34px');style.setProperty('--safe-left','0px');style.setProperty('--safe-right','0px')}
installTimelineTouch();
registerUpdates();
createRoot(document.getElementById('root')!).render(<App/>);
