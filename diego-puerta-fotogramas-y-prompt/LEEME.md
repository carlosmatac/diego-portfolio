# Diego levanta Contact

24 dibujos PNG, generados con ImageGen integrado: 12 poses y sus exposiciones alternativas para line boil. Diego pasa de una posición muy agachada a sostener un borde invisible con los brazos elevados, manteniendo las rodillas flexionadas. Cada dibujo contiene solo al personaje.

## Entrega al agente de la web

1. Añade la carpeta `frames` y `manifest.json` al repo.
2. Pasa al agente el texto completo de `PROMPT-PARA-EL-AGENTE.md`, junto con la captura del footer.
3. Pídele que use el orden de `ascendingFrames` del manifiesto. Los nombres numéricos de los PNG son identificadores, no el orden cronológico final.

El panel negro izquierdo es la puerta. El dibujo de Diego de pie en la columna derecha permanece fijo. El nuevo Diego agachado aparece debajo del panel izquierdo. Esta entrega contiene los recursos y las instrucciones; no modifica la web publicada.

## Características

- Lienzo de 1024 × 1536 px por imagen.
- Fondo blanco opaco, no transparencia. Se integra mediante mezcla sobre la superficie clara detrás del panel.
- El orden se ha establecido por la altura de apoyo real, no por las alturas solicitadas al generador.
- `soleY` permite registrar el apoyo entre imágenes y compensar pequeños desplazamientos del dibujo.
- `contactY` permite colocar el borde inferior del panel sobre las palmas. Los contornos de ambas manos difieren unos pocos píxeles; comprobar un pequeño solapamiento a tamaño real.
- `holdFrames` indica los dos dibujos para sostener arriba con line boil.
- Ritmo inicial sugerido: 10 exposiciones/s en la subida; 5–6 exposiciones/s para sostener. Ajustar al tamaño y ritmo de la web.

Los trazos se han generado de nuevo en cada exposición. No se ha aplicado deformación artificial a los PNG. Son dibujos generados con variaciones de anatomía y trazo; el registro del manifiesto es necesario para la integración y debe comprobarse visualmente a tamaño real.

`prompts-generacion.json` guarda los prompts y referencias de creación. Los intentos descartados de extracción de fondo no forman parte de los fotogramas entregados.
