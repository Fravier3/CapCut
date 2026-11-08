import {useState,useEffect} from 'react';
export function useSmallScreen(){const [small,set]=useState(()=>matchMedia('(max-width: 1023px)').matches);useEffect(()=>{const m=matchMedia('(max-width: 1023px)');const cb=()=>set(m.matches);m.addEventListener('change',cb);return()=>m.removeEventListener('change',cb)},[]);return small}
