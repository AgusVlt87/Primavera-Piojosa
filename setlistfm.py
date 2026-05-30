from urllib.request import urlopen, Request
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor
from datetime import date
import os, json, time

path = os.path.dirname(os.path.realpath(__file__)).replace("\\", "/").strip()

user_agent = "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36"

month_abr = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]

# ── Configurar rango de fechas (inclusive) ──────────────────────────────────
START_DATE = date(2024,  1,  1)
END_DATE   = date(2029, 12, 31)
# ───────────────────────────────────────────────────────────────────────────

BAND_URL = "https://www.setlist.fm/setlists/los-piojos-1bd615a0.html"


def main():
    print(f"Buscando setlists de Los Piojos entre {START_DATE} y {END_DATE}...")
    concert_urls = get_concert_urls(BAND_URL)
    print(f"{len(concert_urls)} shows en el rango de fechas. Bajando setlists...")
    concerts = gather_concert_data(concert_urls)

    missing = len(concert_urls) - len(concerts)
    if missing:
        print(f"Parseados {len(concerts)} setlists ({missing} fallaron).")
    else:
        print(f"Parseados {len(concerts)} setlists.")

    if concerts:
        write_json(concerts)


def write_json(concerts):
    concerts_sorted = sorted(concerts, key=lambda c: (c["year"], c["month"], c["day"]))

    filename = f"Los Piojos {START_DATE.year}-{END_DATE.year}"
    base, n = filename, 1
    while os.path.isfile(f"{path}/{filename}.json"):
        filename = f"{base} ({n})"
        n += 1

    with open(f"{path}/{filename}.json", "w", encoding="utf-8") as f:
        json.dump(concerts_sorted, f, indent=4, ensure_ascii=False)

    print(f'Guardado en "{path}/{filename}.json"')


def gather_concert_data(concert_urls):
    concerts = [None] * len(concert_urls)
    with ThreadPoolExecutor(max_workers=8) as pool:
        for i, url in enumerate(concert_urls):
            pool.submit(get_concert_data, i, url, concerts)
    return [c for c in concerts if c is not None]


def get_concert_data(i, url, concerts):
    try:
        soup = get_soup(url)

        date_block   = soup.find("div", {"class": "dateBlock"})
        info_cont    = soup.find("div", {"class": "infoContainer"})
        headline_div = info_cont.find("div", {"class": "setlistHeadline"})
        setlist_div  = soup.find("div", {"class": "setlistList"})

        year      = int(date_block.find("span", {"class": "year"}).getText().strip())
        month_str = date_block.find("span", {"class": "month"}).getText().strip()
        try:
            month = month_abr.index(month_str.upper()) + 1
        except ValueError:
            month = 1
        day = int(date_block.find("span", {"class": "day"}).getText().strip())

        tour = ""
        tour_a = info_cont.find(
            lambda tag: tag.name == "a" and "title" in tag.attrs
                        and "setlists by tour" in tag["title"]
        )
        if tour_a:
            tour = tour_a.find("span").getText().strip()

        venue = ""
        venue_a = headline_div.find(
            lambda tag: tag.name == "a" and "title" in tag.attrs
                        and "more setlists from" in tag["title"].lower()
        )
        if venue_a:
            venue = venue_a.find("span").getText().strip()

        artist = ""
        strong = headline_div.find("strong")
        if strong:
            a_tag = strong.find("a")
            if a_tag:
                artist = a_tag.getText().strip()

        songs = [a.getText().strip() for a in setlist_div.find_all("a", {"class": "songLabel"})]

        print(f"  {year}.{str(month).zfill(2)}.{str(day).zfill(2)} — {venue} ({len(songs)} canciones)")

        concerts[i] = {
            "artist": artist,
            "year":   year,
            "month":  month,
            "day":    day,
            "venue":  venue,
            "tour":   tour,
            "songs":  songs,
            "url":    url,
        }
    except Exception as e:
        print(f"  ERROR en {url}: {e}")


def get_concert_urls(base_url):
    soup = get_soup(base_url)

    last_a = soup.find("a", {"title": "Go to last page"})
    num_pages = int(last_a.getText().strip()) if last_a else 1

    print(f"Escaneando {num_pages} páginas de listado...")

    page_results = [[] for _ in range(num_pages)]
    with ThreadPoolExecutor(max_workers=8) as pool:
        for i in range(num_pages):
            pool.submit(get_page_concerts, i, page_results, base_url)

    all_concerts = [(url, d) for page in page_results for url, d in page]
    filtered = [url for url, d in all_concerts if START_DATE <= d <= END_DATE]

    print(f"Total shows: {len(all_concerts)}, dentro del rango: {len(filtered)}")
    return filtered


def get_page_concerts(i, page_results, base_url):
    soup = get_soup(base_url + "?page=" + str(i + 1))
    if soup is None:
        return

    results = []
    for a in soup.find_all("a", href=True):
        if "/setlist/" not in a["href"]:
            continue
        title = a.get("title", "")
        if not title.lower().startswith("view this"):
            continue
        url = "https://www.setlist.fm/" + a["href"][3:]

        # Subir en el árbol para encontrar el dateBlock del mismo bloque
        node, date_block = a.parent, None
        for _ in range(10):
            if node is None:
                break
            date_block = node.find("div", {"class": "dateBlock"})
            if date_block:
                break
            node = node.parent

        if date_block:
            try:
                year      = int(date_block.find("span", {"class": "year"}).getText().strip())
                month_str = date_block.find("span", {"class": "month"}).getText().strip()
                month     = month_abr.index(month_str.upper()) + 1
                day       = int(date_block.find("span", {"class": "day"}).getText().strip())
                concert_date = date(year, month, day)
            except Exception:
                concert_date = START_DATE  # si no se puede parsear, incluirlo
        else:
            concert_date = START_DATE

        results.append((url, concert_date))

    page_results[i] = results


def get_soup(url):
    for attempt in range(10):
        try:
            req = Request(url)
            req.add_header("User-Agent", user_agent)
            with urlopen(req, timeout=20) as resp:
                return BeautifulSoup(resp.read(), "html.parser")
        except Exception:
            time.sleep(0.5 * (attempt + 1))
    return None


if __name__ == "__main__":
    main()
