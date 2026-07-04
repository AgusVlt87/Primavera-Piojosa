// ─────────────────────────────────────────────────────────────────────────
// Modelo de datos de la tarjeta Wrapped — GENÉRICO (cualquier banda/tour).
//
// El estado viaja en la URL como un JSON codificado en base64url:
//   /wrapped/<base64url(JSON)>   y   /api/og?data=<base64url(JSON)>
//
// Usamos claves cortas en el "wire" para mantener la URL corta, y las
// expandimos a un objeto normalizado que consumen las plantillas.
// ─────────────────────────────────────────────────────────────────────────

const GOLD = '#d4a843';

// ── base64url <-> objeto ────────────────────────────────────────────────
export function encode(obj) {
  return Buffer.from(JSON.stringify(obj), 'utf8').toString('base64url');
}

export function decode(data) {
  if (!data || typeof data !== 'string') throw new Error('data vacío');
  const json = Buffer.from(data, 'base64url').toString('utf8');
  const obj = JSON.parse(json);
  if (!obj || typeof obj !== 'object') throw new Error('payload inválido');
  return obj;
}

// ── normalización: wire -> forma completa con defaults ──────────────────
// Wire esperado (todas opcionales, se completan con defaults):
//   { t, b, s, st:[[num,lbl],...], j:{n,s,c}, a:{n,s,c,l}, f }
export function normalize(raw = {}) {
  const band = str(raw.b) || 'La Banda';
  const stats = Array.isArray(raw.st) ? raw.st : [];

  return {
    title:    str(raw.t) || band.toUpperCase(),
    band,
    subtitle: str(raw.s) || '',
    stats: stats.slice(0, 3).map((it) => ({
      num:   str(Array.isArray(it) ? it[0] : it?.num) || '0',
      label: str(Array.isArray(it) ? it[1] : it?.label) || '',
    })),
    jewel: raw.j ? {
      label: 'la joya que te tocó',
      name:  str(raw.j.n) || '—',
      sub:   str(raw.j.s) || '',
      color: hex(raw.j.c) || GOLD,
    } : null,
    album: raw.a ? {
      name:  str(raw.a.n) || '—',
      sub:   str(raw.a.s) || '',
      color: hex(raw.a.c) || GOLD,
      logo:  str(raw.a.l) || '',   // key de logo (nombre de archivo sin .png)
    } : null,
    footer: str(raw.f) || '',
  };
}

// ── helpers de saneo (nunca confiar en el input del cliente) ─────────────
function str(v) {
  if (v === null || v === undefined) return '';
  return String(v).slice(0, 240);
}
function hex(v) {
  const s = String(v || '');
  return /^#[0-9a-fA-F]{3,8}$/.test(s) ? s : '';
}

export { GOLD };
