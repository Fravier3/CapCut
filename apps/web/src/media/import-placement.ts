import type {MediaType} from './types';
import type {SceneTracks} from '@/timeline';
import {roundMediaTime,type MediaTime} from '@/wasm';
/** Music starts at the cursor; visual clips append after the last visual clip. */
export function getImportStartTime({type,tracks,cursor}:{type:MediaType;tracks:SceneTracks;cursor:MediaTime}):MediaTime{
 if(type==='audio')return cursor;
 let end=0;
 for(const track of [...tracks.overlay,tracks.main])for(const clip of track.elements){if(clip.type==='video'||clip.type==='image')end=Math.max(end,clip.startTime+clip.duration)}
 return roundMediaTime({time:end});
}
