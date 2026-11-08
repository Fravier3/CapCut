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

Corrección 1.0.3: desplazamiento vertical de pistas con el dedo desde clips/etiquetas, selector y flechas de pistas, revelar la pista seleccionada, altura completa para todas las pistas y un solo menú contextual por pulsación.

Versión 1.0.4: barra móvil visible con Dividir, Recortar, Mover, Eliminar y Deshacer; recorte con cursor y extremos, posición en segundos con validación de colisiones, zoom accesible y cierre de herramientas al insertar un clip.

En teléfono, el botón + de un medio lo añade al final del montaje en vez de superponerlo al cursor; selección de clips revela su pista y su posición horizontal.

Versión 1.1.0: selector específico de audio y detección por extensión; gestos encaminados al controlador real de la línea de tiempo; ajuste Todo y recorte por fotograma/segundos; navegación móvil con Transiciones visible. Fundido a negro, deslizar y zoom funcionan en vista previa y exportación. Los errores de render liberan el bloqueo y los lienzos de video reciclados siempre actualizan su textura. Inicio/editor se incluyen en un módulo único; las actualizaciones PWA guardan antes de recargar y conservan recursos de pestañas anteriores. Logo vectorial basado en la geometría de referencia de Wikimedia (Capcut-icon.svg).

Pruebas adicionales: `cd mobile && node tests/timeline-mobile.mjs && node tests/mobile-regressions.mjs`; `qa.html` es un marco de desarrollo y no se publica.
