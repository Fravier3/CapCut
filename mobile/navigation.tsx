import {useSyncExternalStore} from 'react';
const read=()=>location.hash.slice(1)||'/projects';
export function usePathname(){return useSyncExternalStore(cb=>{window.addEventListener('hashchange',cb);return()=>window.removeEventListener('hashchange',cb)},read)}
export const router={push:(p:string)=>{location.hash=p},replace:(p:string)=>{location.replace('#'+p)},back:()=>history.back(),refresh:()=>location.reload()};
export const useRouter=()=>router;
export function useParams(){const path=usePathname();return {project_id:path.split('/')[2]}}
