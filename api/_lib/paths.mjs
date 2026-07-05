// Resolución de assets (fuentes, logos, wasm) para las Vercel Functions.
//
// Se anclan en process.cwd() (= raíz del deployment en Vercel, y raíz del repo
// en local). Los archivos se empaquetan con la función vía `includeFiles` en
// vercel.json ("api/_lib/**").
import { join } from 'node:path';

export const FN_DIR = join(process.cwd(), 'api', '_lib');
export const FONTS_DIR = join(FN_DIR, 'fonts');
export const LOGOS_DIR = join(FN_DIR, 'logos');
export const WASM_PATH = join(FN_DIR, 'resvg.wasm');
