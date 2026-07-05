// Markup + CSS de la tarjeta para el navegador (página /wrapped/<data>).
// Reusa 1:1 las clases .primavera-card / .pc-* del index.html, para que el
// humano que entra vea exactamente lo mismo que en la app.

export function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// CSS lifteado del index.html (:root + .primavera-card + .pc-*), autocontenido.
export const cardCss = `
@font-face{
  font-family:'Los Piojos';
  src:local('Los Piojos'),url('/assets/fonts/Los_Piojos.ttf') format('truetype');
  font-display:swap;
}
:root{
  --bg:#0f0f0f;--gold:#d4a843;--gold-dim:#9a7830;
  --text:#e4ddd0;--text-dim:#6a6a6a;--border:#282828;
}
*{box-sizing:border-box;margin:0;padding:0}
body{
  font-family:'Outfit',sans-serif;background:var(--bg);color:var(--text);
  min-height:100vh;display:flex;flex-direction:column;align-items:center;
  justify-content:center;padding:28px 16px;gap:22px;
}
.pj{font-family:'Los Piojos','Bebas Neue',sans-serif;color:var(--gold)}
.primavera-card{
  width:540px;max-width:100%;margin:0 auto;background:#0f0f0f;
  background-image:radial-gradient(ellipse 80% 50% at 50% 0%,rgba(212,168,67,.1) 0%,transparent 70%);
  border:1px solid var(--gold-dim);border-radius:12px;padding:36px 32px 24px;
}
.pc-title{
  font-family:'Los Piojos','Bebas Neue',sans-serif;
  font-size:2.4rem;letter-spacing:.06em;color:var(--gold);line-height:1;
  text-shadow:0 0 40px rgba(212,168,67,.25);
}
.pc-sub{font-size:.75rem;color:var(--text-dim);margin-top:5px;letter-spacing:.13em;text-transform:uppercase}
.pc-divider{height:1px;background:var(--border);margin:20px 0}
.pc-row{display:flex;gap:36px;margin-bottom:22px}
.pc-stat-num{font-family:'Bebas Neue',sans-serif;font-size:3rem;color:var(--gold);line-height:1}
.pc-stat-lbl{font-size:.62rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:.1em;margin-top:2px}
.pc-song{border-left:3px solid;padding:10px 14px;background:rgba(255,255,255,.03);border-radius:0 6px 6px 0;margin-bottom:22px}
.pc-song-lbl{font-size:.58rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:.1em;margin-bottom:5px}
.pc-song-name{font-size:1.1rem;font-weight:600;color:var(--text);line-height:1.2}
.pc-song-alb{font-size:.66rem;color:var(--text-dim);margin-top:3px}
.pc-score-wrap{display:flex;align-items:center;gap:18px;margin-bottom:22px}
.pc-score-lbl{font-family:'Los Piojos','Bebas Neue',sans-serif;font-size:1.5rem;color:var(--text);letter-spacing:.04em}
.pc-score-sub{font-size:.6rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:.12em;margin-top:3px}
.pc-footer{font-size:.63rem;color:var(--text-dim);letter-spacing:.08em;font-style:italic;border-top:1px solid var(--border);padding-top:14px;text-align:center;margin-top:4px}
.wrap-actions{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
.btn-sm{
  background:transparent;border:1px solid var(--border);color:var(--text);
  padding:9px 16px;border-radius:8px;cursor:pointer;font-size:.85rem;
  font-family:inherit;text-decoration:none;transition:.15s;
}
.btn-sm:hover{border-color:var(--gold);color:var(--gold)}
.btn-sm.primary{background:var(--gold);color:#111;border-color:var(--gold);font-weight:700}
.wrap-home{font-size:.75rem;color:var(--text-dim);text-decoration:none}
.wrap-home:hover{color:var(--gold)}
`;

// markup de la card a partir del objeto normalizado (data.mjs → normalize)
export function cardMarkup(card) {
  const stats = card.stats.map((s) => `
      <div class="pc-stat">
        <div class="pc-stat-num">${esc(s.num)}</div>
        <div class="pc-stat-lbl">${esc(s.label)}</div>
      </div>`).join('');

  const jewel = card.jewel ? `
    <div class="pc-song" style="border-left-color:${esc(card.jewel.color)}">
      <div class="pc-song-lbl">${esc(card.jewel.label)}</div>
      <div class="pc-song-name">${esc(card.jewel.name)}</div>
      ${card.jewel.sub ? `<div class="pc-song-alb">${esc(card.jewel.sub)}</div>` : ''}
    </div>` : '';

  let album = '';
  if (card.album) {
    const logoKey = card.album.logo || card.album.name;
    const logoSrc = logoKey ? `/assets/logos/${encodeURIComponent(logoKey)}.png` : '';
    const logoImg = logoSrc
      ? `<img src="${esc(logoSrc)}" alt="" style="width:60px;height:60px;object-fit:contain;flex-shrink:0" onerror="this.style.display='none'">`
      : '';
    album = `
    <div class="pc-score-wrap">
      ${logoImg}
      <div>
        <div class="pc-score-lbl" style="color:${esc(card.album.color)}">${esc(card.album.name)}</div>
        ${card.album.sub ? `<div class="pc-score-sub">${esc(card.album.sub)}</div>` : ''}
      </div>
    </div>`;
  }

  const footer = card.footer ? `<div class="pc-footer">${esc(card.footer)}</div>` : '';

  return `
  <div class="primavera-card" id="primavera-card">
    <div class="pc-title">${esc(card.title)}</div>
    <div class="pc-sub">${esc(card.subtitle)}</div>
    <div class="pc-divider"></div>
    <div class="pc-row">${stats}
    </div>${jewel}${album}${footer}
  </div>`;
}
