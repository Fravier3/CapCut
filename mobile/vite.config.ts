import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import {fileURLToPath} from 'node:url';
const file=(p:string)=>fileURLToPath(new URL(p,import.meta.url));
export default defineConfig({base:'/CapCut/',plugins:[react(),tailwind(),wasm()],resolve:{alias:{'@':file('../apps/web/src'),'next/navigation':file('./navigation.tsx'),'next/link':file('./link.tsx'),'next/image':file('./image.tsx')}},define:{'process.env.NODE_ENV':JSON.stringify('production')},publicDir:'../apps/web/public',build:{target:'es2022',sourcemap:false},worker:{plugins:()=>[wasm()],format:'es'}});
