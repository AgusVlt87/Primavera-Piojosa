"""
Calcula el índice de popularidad promedio por show (2024-2025 vuelta).

INPUT : canciones_popularidad.xlsx  — exportado por la notebook
        shows.json                  — en el mismo directorio

OUTPUT: tabla de scores + bloque JS listo para pegar en index.html

Uso:
    python calcular_popularidad_shows.py
    python calcular_popularidad_shows.py "C:/ruta/a/canciones_popularidad.xlsx"
"""

import json
import sys
import unicodedata
from pathlib import Path

try:
    import pandas as pd
except ImportError:
    print("ERROR: instalá pandas  →  pip install pandas openpyxl")
    sys.exit(1)


# ─── normalización idéntica a la notebook ────────────────────────────────────

def normalize(song: str) -> str:
    song = song.strip().lower()
    song = "".join(
        c for c in unicodedata.normalize("NFKD", song)
        if not unicodedata.combining(c)
    )
    return song


def split_songs(raw_list: list) -> list:
    songs = []
    for item in raw_list:
        for part in item.split(" / "):
            part = part.strip()
            if part:
                songs.append(part)
    return songs


# ─── busca el xlsx en ubicaciones habituales ─────────────────────────────────

CANDIDATES = [
    Path("canciones_popularidad.xlsx"),
    Path.home() / "Desktop" / "canciones_popularidad.xlsx",
    Path.home() / "Documents" / "canciones_popularidad.xlsx",
    Path(r"C:\Users\Yo\Desktop\setlist\SetlistFM-Setlist-Evolution\canciones_popularidad.xlsx"),
    Path(r"C:\Users\Agus\Desktop\canciones_popularidad.xlsx"),
]


def find_xlsx(hint: str | None) -> Path:
    if hint:
        p = Path(hint)
        if p.exists():
            return p
        print(f"ERROR: no existe el archivo indicado: {p}")
        sys.exit(1)
    for p in CANDIDATES:
        if p.exists():
            return p
    print("ERROR: no se encuentra canciones_popularidad.xlsx.")
    print("Pasalo como argumento o copialo a la carpeta del proyecto.")
    sys.exit(1)


# ─── main ────────────────────────────────────────────────────────────────────

def main():
    xlsx_path = find_xlsx(sys.argv[1] if len(sys.argv) > 1 else None)
    shows_path = Path(__file__).parent / "shows.json"

    if not shows_path.exists():
        print("ERROR: no se encuentra shows.json")
        sys.exit(1)

    with open(shows_path, encoding="utf-8") as f:
        shows = json.load(f)

    df = pd.read_excel(xlsx_path)

    # Detectar nombres de columnas (pueden venir con encoding raro del xlsx)
    col_song = next(
        (c for c in df.columns if "anci" in c.lower()), None
    )
    col_raw = next(
        (c for c in df.columns if "indice_popularidad" in c and "norm" not in c), None
    )
    col_norm = next(
        (c for c in df.columns if "indice_popularidad_norm" in c), None
    )

    if not col_song or not col_raw:
        print(f"ERROR: columnas inesperadas en el xlsx: {list(df.columns)}")
        sys.exit(1)

    df["_k"] = df[col_song].apply(normalize)
    lookup_raw  = dict(zip(df["_k"], df[col_raw]))
    lookup_norm = dict(zip(df["_k"], df[col_norm])) if col_norm else {}

    # ─── calcular por show ───────────────────────────────────────────────────
    results = []

    for show in shows:
        fecha = f"{show['year']}-{show['month']:02d}-{show['day']:02d}"
        songs = split_songs(show["songs"])

        raw_scores  = [lookup_raw.get(normalize(s))  for s in songs]
        norm_scores = [lookup_norm.get(normalize(s)) for s in songs]
        raw_scores  = [s for s in raw_scores  if s is not None]
        norm_scores = [s for s in norm_scores if s is not None]

        results.append({
            "fecha":   fecha,
            "venue":   show["venue"],
            "raw":     sum(raw_scores)  / len(raw_scores)  if raw_scores  else None,
            "norm":    sum(norm_scores) / len(norm_scores) if norm_scores else None,
            "matched": len(raw_scores),
            "total":   len(songs),
        })

    results.sort(key=lambda x: x["raw"] or 0, reverse=True)

    # ─── tabla de resultados ─────────────────────────────────────────────────
    print(f"\n{'SHOW':<14}  {'VENUE':<44}  {'RAW':>7}  {'NORM':>7}  MATCH")
    print("─" * 88)
    for r in results:
        raw  = f"{r['raw']:.4f}"  if r["raw"]  is not None else "   N/A"
        norm = f"{r['norm']:.4f}" if r["norm"] is not None else "   N/A"
        print(f"{r['fecha']:<14}  {r['venue'][:44]:<44}  {raw:>7}  {norm:>7}  {r['matched']}/{r['total']}")

    # ─── bloque JS para pegar en index.html ──────────────────────────────────
    print("\n\n// ─── copiar en index.html (después de VENUE_SLUG) ───────────────────────")
    print("const SHOW_POPULARITY = {")
    for r in sorted(results, key=lambda x: x["fecha"]):
        if r["raw"] is not None:
            print(f"  '{r['fecha']}': {r['raw']:.4f},  // {r['venue'][:35]}")
        else:
            print(f"  '{r['fecha']}': null,  // {r['venue'][:35]} — sin match")
    print("};")

    coverage_ok = sum(1 for r in results if r["matched"] / r["total"] >= 0.7)
    print(f"\n// Cobertura ≥70% en {coverage_ok}/{len(results)} shows")


if __name__ == "__main__":
    main()
