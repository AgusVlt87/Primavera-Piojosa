// Construye el árbol de elementos para Satori (sin JSX / sin React).
// Replica el sistema visual de .primavera-card del index.html, reflowado a
// 1200×630 (formato summary_large_image de Twitter/OG).
import { logoDataUri } from './logos.mjs';

// paleta lifteada del :root del index.html
const C = {
  bg: '#0f0f0f',
  gold: '#d4a843',
  goldDim: '#9a7830',
  text: '#e4ddd0',
  dim: '#8a8a86',      // un pelín más claro que --text-dim para legibilidad a tamaño OG
  border: '#2f2f2f',
};

// hyperscript minimal para Satori: h(type, style, children)
const h = (type, style, children) => ({
  type,
  props: {
    style,
    ...(children !== undefined ? { children } : {}),
  },
});
const img = (src, style) => ({ type: 'img', props: { src, style } });

export function buildCard(card) {
  const stats = card.stats.length ? card.stats : [{ num: '—', label: '' }];

  const logo = card.album ? logoDataUri(card.album.logo || card.album.name) : null;

  return h('div', {
    display: 'flex',
    flexDirection: 'column',
    width: '1200px',
    height: '630px',
    backgroundColor: C.bg,
    // glow dorado superior (mismo gesto que el radial-gradient de la card)
    backgroundImage:
      'radial-gradient(ellipse 70% 55% at 50% -8%, rgba(212,168,67,0.16) 0%, rgba(212,168,67,0) 70%)',
    color: C.text,
    fontFamily: 'Outfit',
    padding: '54px 64px 44px',
    justifyContent: 'space-between',
    border: `1px solid ${C.goldDim}`,
  }, [
    // ── encabezado ──────────────────────────────────────────────
    h('div', { display: 'flex', flexDirection: 'column' }, [
      h('div', {
        fontFamily: 'Los Piojos',
        fontSize: '92px',
        color: C.gold,
        lineHeight: 1,
        letterSpacing: '0.04em',
        textShadow: '0 0 45px rgba(212,168,67,0.3)',
      }, card.title),
      h('div', {
        fontSize: '22px',
        color: C.dim,
        marginTop: '14px',
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
      }, card.subtitle),
    ]),

    // línea divisoria
    h('div', { display: 'flex', height: '1px', backgroundColor: C.border }, []),

    // ── stats ───────────────────────────────────────────────────
    h('div', { display: 'flex', gap: '80px' },
      stats.map((s) => h('div', { display: 'flex', flexDirection: 'column' }, [
        h('div', {
          fontFamily: 'Bebas Neue',
          fontSize: '104px',
          color: C.gold,
          lineHeight: 1,
        }, String(s.num)),
        h('div', {
          fontSize: '20px',
          color: C.dim,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          marginTop: '6px',
        }, s.label),
      ])),
    ),

    // ── joya que te tocó ────────────────────────────────────────
    card.jewel ? h('div', {
      display: 'flex',
      flexDirection: 'column',
      borderLeft: `6px solid ${card.jewel.color}`,
      paddingLeft: '22px',
      paddingTop: '6px',
      paddingBottom: '6px',
    }, [
      h('div', {
        fontSize: '18px',
        color: C.dim,
        textTransform: 'uppercase',
        letterSpacing: '0.13em',
        marginBottom: '8px',
      }, card.jewel.label),
      h('div', { fontSize: '40px', fontWeight: 600, color: C.text, lineHeight: 1.15 }, card.jewel.name),
      card.jewel.sub
        ? h('div', { fontSize: '19px', color: C.dim, marginTop: '8px' }, card.jewel.sub)
        : null,
    ].filter(Boolean)) : null,

    // ── álbum del tour ──────────────────────────────────────────
    card.album ? h('div', { display: 'flex', alignItems: 'center', gap: '26px' }, [
      logo ? img(logo, { width: '92px', height: '92px', objectFit: 'contain' }) : null,
      h('div', { display: 'flex', flexDirection: 'column' }, [
        h('div', {
          fontFamily: 'Los Piojos',
          fontSize: '46px',
          color: card.album.color,
          letterSpacing: '0.03em',
          lineHeight: 1.05,
        }, card.album.name),
        card.album.sub
          ? h('div', {
              fontSize: '18px',
              color: C.dim,
              textTransform: 'uppercase',
              letterSpacing: '0.11em',
              marginTop: '6px',
            }, card.album.sub)
          : null,
      ].filter(Boolean)),
    ].filter(Boolean)) : null,

    // ── footer ciudad ───────────────────────────────────────────
    card.footer ? h('div', {
      display: 'flex',
      fontSize: '18px',
      color: C.dim,
      fontStyle: 'italic',
      letterSpacing: '0.06em',
      borderTop: `1px solid ${C.border}`,
      paddingTop: '18px',
    }, card.footer) : null,
  ].filter(Boolean));
}

export { C as COLORS };
