// Resuelve el logo de un álbum a un data-URI PNG para embeberlo en el SVG de
// Satori (Satori necesita la imagen como data-URI o URL absoluta fetcheable).
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { LOGOS_DIR } from './paths.mjs';

// índice normalizado nombre->archivo (tolera acentos/espacios/mayúsculas)
let index = null;
function buildIndex() {
  if (index) return index;
  index = new Map();
  try {
    for (const f of readdirSync(LOGOS_DIR)) {
      if (!f.toLowerCase().endsWith('.png')) continue;
      index.set(norm(f.replace(/\.png$/i, '')), f);
    }
  } catch { /* carpeta ausente: sin logos */ }
  return index;
}

function norm(s) {
  return String(s)
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // saca acentos (U+0300–U+036F)
    .toLowerCase().replace(/\s+/g, ' ').trim();
}

const cache = new Map();

// key = título del álbum (ej. "Azul", "Covers - Inéditos - Otros")
export function logoDataUri(key) {
  if (!key) return null;
  if (cache.has(key)) return cache.get(key);
  const file = buildIndex().get(norm(key));
  let uri = null;
  if (file) {
    try {
      const b = readFileSync(join(LOGOS_DIR, file));
      uri = `data:image/png;base64,${b.toString('base64')}`;
    } catch { uri = null; }
  }
  cache.set(key, uri);
  return uri;
}
