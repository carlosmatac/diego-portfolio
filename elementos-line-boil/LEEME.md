# Elementos a lápiz para Diego Prados

Colección creada con ImageGen integrado a partir del estilo del fotograma de Diego con los brazos cruzados. Se ha revisado https://www.diegoprados.com/ para seleccionar los objetos. Son recursos decorativos, no nuevas afirmaciones sobre su trayectoria.

## Contenido

Cada carpeta contiene tres dibujos PNG independientes (`01.png`, `02.png`, `03.png`). Los originales conservan su canal alfa. El fondo exterior es transparente; las zonas interiores de los objetos contienen blanco y lápiz. No son máscaras monocromas de trazos.

- `tierra`: perfil internacional. Evitar repetirlo al lado del globo que ya existe en Studies. Sin rotación, solo variación del lápiz.
- `microfono`: introducción de AUGE o encabezado de sus sesiones. Representa el formato de conversación y conferencia.
- `libro`: encabezado de Studies o Blog, ligado a lectura y análisis.
- `microchip`: investigación sobre semiconductores y política industrial. Usarlo junto al contenido correspondiente, no como símbolo genérico de toda su experiencia.

`index.html` muestra los cuatro loops, con pausa, avance por dibujos, tres velocidades y fondos claro/oscuro. Puede abrirse directamente junto a las carpetas o servirse con un servidor estático. `manifest.json` describe las secuencias; `prompts.json` conserva los prompts y las referencias de generación. La colección no modifica ni publica la web de producción.

## Uso visual

Comenzar con 6 cambios de dibujo por segundo y el orden 01, 02, 03, 02. Cada exposición dura unos 167 ms. No usar interpolación, fundidos ni transformaciones de posición: las diferencias ya están en el lápiz. El movimiento perceptible debe ser pequeño. Para un efecto más tranquilo, usar 4 cambios por segundo.

Mantener exactamente la misma caja de imagen en todos los dibujos de cada objeto. No recortar o centrar cada frame por separado: se perdería el registro entre versiones. Los dibujos base difieren de densidad entre objetos, por lo que conviene ajustar su tamaño visual individualmente.

Ubicarlos en los márgenes de los títulos, nunca detrás de texto largo. Un elemento destacado por sección suele bastar. Tamaño orientativo: 160–260 px en escritorio y 100–160 px en móvil, sujeto a la composición. En móvil colocarlos encima o debajo del título cuando el margen sea insuficiente.

## Fondos

Sobre la superficie clara de la web, `mix-blend-mode: multiply` integra los blancos interiores. Sobre superficies oscuras, la vista previa usa `filter: invert(1)` y `mix-blend-mode: screen`, que produce una versión clara del lápiz. Aislar el contenedor con `isolation: isolate` y asignarle el mismo color de fondo que la sección, para que la mezcla tenga una superficie sobre la que actuar; no aplicar el filtro a la sección completa. Son ajustes de presentación, no archivos PNG modificados.

## Accesibilidad y carga

Respetar `prefers-reduced-motion` mostrando el primer dibujo fijo. Ofrecer pausa. Marcar los dibujos puramente decorativos con `aria-hidden="true"` o `alt=""`. No anunciarlos en cada cambio de fotograma.

Precargar y decodificar los tres dibujos antes de empezar cada loop. Para producción, exportar una versión WebP adaptada al tamaño real de uso conservando alfa, dimensiones y encuadre idénticos en los tres archivos. Los PNG entregados son los originales de trabajo, no una descarga optimizada para toda la web. Cargar solo los elementos cercanos al viewport y detener los cambios cuando no se vean o la pestaña esté oculta. La vista previa carga la colección completa para compararla.

La Tierra es una ilustración editorial de orientación atlántica, no un mapa para consultar fronteras o datos geográficos.
