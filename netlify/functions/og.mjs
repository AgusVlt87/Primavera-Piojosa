// /api/og?data=<base64url>  →  PNG 1200×630
// Satori (JSX-free) → SVG → @resvg/resvg-wasm → PNG. Sin binarios nativos.
import satori from 'satori';
import { Resvg, initWasm } from '@resvg/resvg-wasm';
import { readFileSync } from 'node:fs';
import { decode, normalize } from './lib/data.mjs';
import { getFonts } from './lib/fonts.mjs';
import { buildCard } from './lib/card-satori.mjs';
import { WASM_PATH } from './lib/paths.mjs';

// El wasm de resvg se inicializa una sola vez por contenedor.
let wasmReady = null;
function ensureWasm() {
  if (!wasmReady) {
    const bin = readFileSync(WASM_PATH);
    wasmReady = initWasm(bin).catch((e) => {
      // otra copia del módulo ya lo inicializó en este proceso: no es error
      if (String(e?.message || e).includes('Already initialized')) return;
      throw e;
    });
  }
  return wasmReady;
}

export const handler = async (event) => {
  try {
    const data = event.queryStringParameters?.data;
    const card = normalize(decode(data));

    const svg = await satori(buildCard(card), {
      width: 1200,
      height: 630,
      fonts: getFonts(),
    });

    await ensureWasm();
    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
    const png = resvg.render().asPng();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/png',
        // misma data => misma imagen: cacheamos fuerte
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
      body: Buffer.from(png).toString('base64'),
      isBase64Encoded: true,
    };
  } catch (e) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      body: 'OG error: ' + (e?.message || String(e)),
    };
  }
};
