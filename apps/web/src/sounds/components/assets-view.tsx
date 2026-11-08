import {MediaView} from '@/components/editor/panels/assets/views/assets';
export function SoundsView(){return <div className="flex h-full flex-col min-h-0"><p className="text-xs text-muted-foreground px-3 py-2">Importa tu música o un archivo de audio. Toca + para añadirlo al montaje.</p><div className="flex-1 min-h-0"><MediaView kind="audio"/></div></div>}
