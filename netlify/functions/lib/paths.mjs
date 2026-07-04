// Resolución de assets robusta frente a cualquier bundler de Netlify.
//
// Los `included_files` de netlify.toml se descomprimen en el runtime bajo
// process.cwd() (= LAMBDA_TASK_ROOT) preservando su ruta repo-relativa. En
// local, process.cwd() es la raíz del repo. Por eso anclamos SIEMPRE en cwd
// en vez de import.meta.url (que esbuild reescribe al colapsar los módulos).
import { join } from 'node:path';

export const FN_DIR = join(process.cwd(), 'netlify', 'functions');
export const FONTS_DIR = join(FN_DIR, 'fonts');
export const LOGOS_DIR = join(FN_DIR, 'logos');
export const WASM_PATH = join(FN_DIR, 'lib', 'resvg.wasm');
