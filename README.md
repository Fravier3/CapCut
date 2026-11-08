# CapCut FJ

Adaptación móvil de OpenCut Classic (MIT), con inicio propio, paneles táctiles y publicación estática en GitHub Pages. Proyecto independiente de CapCut/ByteDance.

## Desarrollo

`cd mobile && npm ci --legacy-peer-deps --workspaces=false`

Desde la raíz: `ln -s ../../mobile/node_modules apps/web/node_modules`.

`cd mobile && npm run dev` o `npm run build`.

Las fuentes del editor están en `apps/web/src`; la integración móvil, navegación hash, estilos, actualización PWA y configuración Vite están en `mobile/`. Solo `mobile/dist` se publica. Los proyectos y medios se guardan en IndexedDB/OPFS del dispositivo. No hay cuentas ni sincronización remota.

El editor conserva el motor Rust/WASM de OpenCut. Se añadió renderizado Canvas2D para equipos sin WebGPU. En ese modo los efectos de shaders no están disponibles. La exportación MP4/WebM requiere soporte WebCodecs/códecs del navegador. Audio propio se importa desde el dispositivo; no se usa el backend privado Freesound de OpenCut.

Verificación: compilación local, inicio/editor en navegador con marcos 390×844 y 360×800, insets simulados de 59/34 px, creación de proyecto, inserción de texto y exportación. Safari/iPhone y Android físicos pendientes de validación.

Procedencia y licencia: OpenCut Classic, https://github.com/opencut-app/opencut-classic, MIT. Se conserva LICENSE. Identidad de instalación estable: `/CapCut/`.

Corrección 1.0.1: almacenamiento alternativo IndexedDB si falla la escritura OPFS; confirmación solo tras guardado real; clips importados se añaden al montaje móvil. Pruebas de regresión: `cd mobile && node tests/storage-import.mjs`.

Corrección 1.0.2: escritura OPFS por bloques con verificación de tamaño, alternativa IndexedDB con bloques de bytes sin clonar File/Blob, no rechazar importaciones por estimaciones previas, mantener selección de Fotos hasta terminar lectura y mostrar causa real de errores. Sin integración Drive.
