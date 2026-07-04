// /wrapped/<base64url>  →  HTML con meta Open Graph dinámicos + la tarjeta
// renderizada (lo que ve un humano) + botones para compartir.
import { decode, normalize } from './lib/data.mjs';
import { cardCss, cardMarkup, esc } from './lib/card-html.mjs';

const FALLBACK_HOST = 'primavera-piojosa.netlify.app';

export const handler = async (event) => {
  // El <data> puede venir en el path (rewrite) o como ?data=
  let data = '';
  const m = (event.path || '').match(/\/wrapped\/([^/?#]+)/);
  if (m) data = m[1];
  if (!data) data = event.queryStringParameters?.data || '';

  let card;
  try {
    card = normalize(decode(data));
  } catch {
    return { statusCode: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' },
      body: '<!doctype html><meta charset="utf-8"><p>Tarjeta no encontrada.</p><p><a href="/">Volver al inicio</a></p>' };
  }

  const h = event.headers || {};
  const host = h['x-forwarded-host'] || h.host || FALLBACK_HOST;
  const proto = (h['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const origin = `${proto}://${host}`;
  const dataEnc = encodeURIComponent(data);
  const pageUrl = `${origin}/wrapped/${dataEnc}`;
  const ogImage = `${origin}/api/og?data=${dataEnc}`;

  const title = `${card.title} · ${card.band}`;
  const descParts = [];
  if (card.stats[0]) descParts.push(`${card.stats[0].num} ${card.stats[0].label}`);
  if (card.jewel && card.jewel.name !== '—') descParts.push(`💎 ${card.jewel.name}`);
  if (card.album && card.album.name !== '—') descParts.push(`💿 ${card.album.name}`);
  const description = descParts.join(' · ') || card.subtitle;

  // texto para compartir (el link va aparte en Twitter, embebido en WhatsApp)
  const shareText = `${card.title} — ${description}`;
  const twitterHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageUrl)}`;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + pageUrl)}`;

  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">

<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(card.band)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${esc(ogImage)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="${esc(pageUrl)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${esc(ogImage)}">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>${cardCss}</style>
</head>
<body>
  ${cardMarkup(card)}
  <div class="wrap-actions">
    <a class="btn-sm primary" href="${esc(twitterHref)}" target="_blank" rel="noopener">🐦 Compartir en X</a>
    <a class="btn-sm" href="${esc(whatsappHref)}" target="_blank" rel="noopener">💬 WhatsApp</a>
    <a class="btn-sm" href="${esc(ogImage)}" download="wrapped.png">⬇️ Descargar imagen</a>
  </div>
  <a class="wrap-home" href="/">← Armá la tuya</a>
</body>
</html>`;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // la página es determinística para un mismo data
      'Cache-Control': 'public, max-age=3600',
    },
    body: html,
  };
};
