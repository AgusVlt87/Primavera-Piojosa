// /api/og?data=<base64url>  →  PNG 1200×630  (Vercel Function, runtime Node)
// Satori (JSX-free) → SVG → @resvg/resvg-wasm → PNG. Sin binarios nativos.
import satori from 'satori';
import { Resvg, initWasm } from '@resvg/resvg-wasm';
import { readFileSync } from 'node:fs';
import { decode, normalize } from './_lib/data.mjs';
import { getFonts } from './_lib/fonts.mjs';
import { buildCard } from './_lib/card-satori.mjs';
import { WASM_PATH } from './_lib/paths.mjs';

// El wasm de resvg se inicializa una sola vez por contenedor.
let wasmReady = null;
function ensureWasm() {
  if (!wasmReady) {
    const bin = readFileSync(WASM_PATH);
    wasmReady = initWasm(bin).catch((e) => {
      if (String(e?.message || e).includes('Already initialized')) return;
      throw e;
    });
  }
  return wasmReady;
}

export default async function handler(req, res) {
  try {
    const data = req.query?.data;
    const card = normalize(decode(data));

    const svg = await satori(buildCard(card), {
      width: 1200,
      height: 630,
      fonts: getFonts(),
    });

    await ensureWasm();
    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
    const png = resvg.render().asPng();

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.status(200).send(Buffer.from(png));
  } catch (e) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(400).send('OG error: ' + (e?.message || String(e)));
  }
}
