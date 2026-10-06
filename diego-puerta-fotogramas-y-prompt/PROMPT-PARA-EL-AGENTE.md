# Prompt de implementación

Implementa en el footer existente de Diego Prados una interacción dibujada a lápiz: el bloque izquierdo de Contact se levanta verticalmente como una puerta de cochera y revela a Diego agachado debajo, empujándolo hacia arriba con ambas manos. Utiliza los fotogramas adjuntos. Haz el trabajo en el repo; no publiques en producción.

## Alcance visual exacto

El footer de referencia tiene una columna izquierda negra con Contact, descripción, enlaces y copyright, y una columna derecha clara con Diego de pie y los brazos cruzados. SOLO el panel negro izquierdo se desplaza. Su fondo, título, textos, enlaces y copyright suben juntos como una única pieza rígida. La columna derecha mantiene exactamente posición, tamaño, fondo, contenido y comportamiento previo; no le apliques ninguna animación nueva. No transformes el grid ni el footer padre. No conviertas la puerta en un acordeón, una persiana de lamas, una rotación 3D o una apertura hacia los lados.

Debajo del panel aparece otro dibujo de Diego en cuclillas, sujetando con las palmas su borde inferior. El personaje de la derecha permanece en su sitio: esta duplicación es intencionada. No añadas una puerta dibujada, un garaje, decorado ni utilería. El panel real de Contact hace de puerta.

## Archivos y orden

Localiza la carpeta de este paquete. Lee `manifest.json` antes de programar. Contiene dimensiones, orden de reproducción y coordenadas de contacto y apoyo por dibujo. Usa `frames/` como fuente, sin regenerar ilustraciones y sin recortarlas individualmente. Los números de archivo identifican dibujos; el orden correcto está en el manifiesto.

Los PNG llevan fondo blanco opaco. NO asumas que tienen transparencia. En la capa clara donde vive el personaje, utiliza `mix-blend-mode: multiply`, con fondo sólido igual al de esa superficie y aislamiento local. El panel negro se coloca en otra capa superior, fuera del grupo de mezcla. Nunca mezcles el blanco del sprite con el panel negro ni apliques filtros al footer entero. Conserva los márgenes originales de todos los dibujos.

## Estructura de capas

1. Contenedor izquierdo que conserva sus dimensiones de layout, con `position: relative` y `overflow: hidden`.
2. Superficie de revelado clara, del mismo blanco grisáceo que usa la web.
3. Dibujo de Diego, centrado en esa superficie, independiente del panel móvil y con sus apoyos registrados mediante el manifiesto.
4. Panel original de Contact en primer plano, ocupando al inicio todo el contenedor y moviéndose únicamente mediante `translateY`.
5. Columna derecha como hermana de este contenedor, sin participar en la transformación.

No animes height, padding o las filas del grid: la apertura no debe cambiar la altura de la página ni desplazar la columna derecha. Recorta la parte del panel que sale por arriba para que no invada la sección anterior.

## Sincronización: las palmas mandan

No inventes dos animaciones con duraciones parecidas. Usa un único reloj para seleccionar dibujo y posición del panel. El borde inferior del panel debe coincidir con la línea horizontal de apoyo de ambas palmas.

Todas las coordenadas del manifiesto se expresan en píxeles del lienzo original. Si `s` es el factor uniforme de escala, `groundY` el suelo dentro del contenedor izquierdo, `soleY` el apoyo del dibujo actual y `contactY` su altura de palmas:

```js
const spriteTop = groundY - soleY * s;
const edgeY = spriteTop + contactY * s;
const panelTranslateY = edgeY - panelHeight;
```

El sprite usa `spriteTop` y escala uniforme. El panel tiene altura fija `panelHeight`, por lo que su borde inferior acaba exactamente en `edgeY`. Las medidas se calculan en el mismo sistema de coordenadas del contenedor izquierdo. No combines coordenadas del viewport con coordenadas locales. No uses `object-fit: cover` ni escales cada dibujo por separado.

Actualiza frame, registro del sprite y transformación del panel juntos, en la misma actualización. El contorno del lápiz puede variar unos píxeles; conserva el contacto con un solapamiento mínimo de 1–2 px de pantalla. No dejes las manos flotando ni cortes la cabeza. Si aplicas easing, aplícalo al progreso común que selecciona las exposiciones, no a una transición CSS independiente del panel.

## Coreografía inicial

La interacción parte del footer normal, con todos los datos legibles. Reproduce el gesto una sola vez cuando el footer esté mayoritariamente visible, tras una breve pausa de unos 2 segundos. Si el usuario está enfocando, seleccionando o activando los enlaces de contacto, pospón la reproducción. Ofrece un control discreto y accesible para repetir o saltar el gesto, compatible con ratón, teclado y toque. No hagas depender el efecto exclusivamente de hover, no secuestres el scroll y no repitas la sorpresa cada vez que el footer entra un poco en pantalla.

Al activar:

- Revelado inicial breve: la primera pose agachada empieza debajo de la zona recortada. Desplaza ese dibujo verticalmente hacia su posición de apoyo mientras su línea de palmas y el borde del panel suben juntos. En el instante cerrado, `spriteTop = panelHeight - contactY * s`, de modo que las manos comiencen justo en el borde inferior y el cuerpo quede oculto por abajo. Interpola hasta la posición de apoyo indicada por `soleY`. Esta entrada corresponde a que Diego asoma desde fuera de la zona visible; no mantengas un deslizamiento de pies una vez apoyado.
- Empuje: recorre la secuencia ascendente del manifiesto durante unos 2–2,8 segundos, ajustando el ritmo tras verla en el footer real. Las rodillas y los brazos hacen el esfuerzo, y las pequeñas variaciones de lápiz mantienen el line boil.
- Sostener: alterna los dibujos de `holdFrames` a unas 5–6 exposiciones por segundo durante un instante. Diego no debe congelarse, girar la cabeza ni guiñar el ojo si esos gestos no están en los archivos.
- Volver: reproduce la secuencia en orden inverso para bajar suavemente el panel, invierte el revelado inicial y restaura el footer original. Deja accesible la acción de repetir.

Una activación debe terminar por sí sola y devolver el contacto. No repitas el ciclo continuamente. Permite cerrar o saltar la animación. Durante el movimiento, evita que los enlaces que se desplazan puedan recibir un foco invisible; conserva una vía accesible y estable a los datos de contacto, sin duplicar enlaces en el orden de tabulación. No interceptes clics en los enlaces originales para iniciar el efecto.

## Móvil y accesibilidad

En móvil, la animación debe quedar confinada al bloque de Contact, incluso si las dos columnas se apilan. El bloque de la imagen de la derecha mantiene su lugar en el flujo. Ajusta escala y apertura para que ambas manos, la cara y los pies quepan sin provocar scroll horizontal. Mide con `ResizeObserver` y recalcula desde las coordenadas originales al cambiar el ancho. Si la altura disponible no permite el efecto con claridad, usa una apertura más contenida, no un recorte de la cara.

Con `prefers-reduced-motion: reduce`, conserva el footer normal y accesible sin reproducción automática ni line boil. Los dibujos son decorativos: `alt=""` o `aria-hidden="true"`, sin anuncios por frame. Conserva foco visible y un botón de control con nombre comprensible. Detén reproducción fuera del viewport y cuando la pestaña esté oculta.

## Rendimiento y comprobación

Los PNG originales son recursos de trabajo. Genera derivados WebP adecuados al tamaño de pantalla, conservando dimensiones relativas, proporciones y márgenes. Si cambias resolución, usa coordenadas normalizadas o aplica el mismo factor al manifiesto. Precarga y decodifica los frames necesarios antes de habilitar la reproducción. No muestres huecos blancos entre dibujos. No añadas una librería de animación pesada si las APIs existentes bastan.

Comprueba la interacción a velocidad normal y fotograma a fotograma. Verifica especialmente contacto palma-borde, estabilidad de los pies tras el revelado, continuidad de subida y bajada, ausencia de cambios de layout, columna derecha inmóvil, enlaces de contacto recuperables, teclado, movimiento reducido y móvil de 360–390 px. No declares terminada la integración sin verla en el navegador. Entrega una vista previa local y resume cualquier ajuste pendiente.
