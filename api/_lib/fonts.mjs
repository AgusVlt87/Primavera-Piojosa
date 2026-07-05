// Carga los buffers de fuentes para Satori (que NO lee @font-face vía CSS).
// Se leen una sola vez y quedan cacheadas a nivel de módulo.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { FONTS_DIR } from './paths.mjs';

const buf = (name) => readFileSync(join(FONTS_DIR, name));

let cache = null;

export function getFonts() {
  if (cache) return cache;
  cache = [
    { name: 'Los Piojos', data: buf('Los_Piojos.ttf'),        weight: 400, style: 'normal' },
    { name: 'Bebas Neue', data: buf('BebasNeue-Regular.ttf'), weight: 400, style: 'normal' },
    { name: 'Outfit',     data: buf('Outfit-Regular.ttf'),    weight: 400, style: 'normal' },
    { name: 'Outfit',     data: buf('Outfit-SemiBold.ttf'),   weight: 600, style: 'normal' },
    { name: 'Outfit',     data: buf('Outfit-Bold.ttf'),       weight: 700, style: 'normal' },
  ];
  return cache;
}
