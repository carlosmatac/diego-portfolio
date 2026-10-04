# Diego: saludo y sonrisa

40 dibujos originales de 1024 × 1536 píxeles, generados con ImageGen integrado. El montaje utiliza 84 exposiciones a 10 fps, durante 8,4 segundos. Los dibujos se conservan sin deformaciones ni interpolación de movimiento.

`diego-saludo.mp4` contiene el ciclo: reposo, saludo, brazos cruzados con sonrisa y parpadeo, regreso al reposo. El fondo es blanco.

`ver-saludo.html` es un visor autónomo con los vídeos incrustados. Al abrirlo reproduce una entrada de 6 segundos: Diego se acerca caminando, del 15 % al 100 % de escala, y enlaza con el ciclo de saludo. La entrada no vuelve a repetirse automáticamente. «Probar llegada» permite repetirla; «Reiniciar loop» la omite. Incluye pausa, cámara lenta, avance por fotogramas y detalle ampliado. Si el sistema solicita movimiento reducido, espera a una acción del usuario.

`fotogramas.zip` contiene los 40 PNG y `secuencia.json`, con el orden de exposición y las fases. `plan.json` describe las poses. `prompts-recuperados.json` conserva los prompts originales que sobrevivieron en el registro de generación, incluidos los de las correcciones finales.

El archivo fuente del montaje está en `work/diego-saludo-v4/montar.py` dentro del proyecto; el visor fuente está junto a él en `visor.html`.
