---
jupyter:
  kernelspec:
    display_name: Python 3
    language: python
    name: python3
  language_info:
    codemirror_mode:
      name: ipython
      version: 3
    file_extension: .py
    mimetype: text/x-python
    name: python
    nbconvert_exporter: python
    pygments_lexer: ipython3
    version: 3.12.10
  nbformat: 4
  nbformat_minor: 5
---

::: {#5578dbae .cell .code execution_count="139"}
``` python
import json
import pandas as pd
import plotly.express as px
from datetime import date
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from matplotlib.animation import FuncAnimation
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm
import unicodedata
```
:::

::: {#6c03c188 .cell .code execution_count="140"}
``` python

# Función para normalizar nombres de canciones (quita espacios extra y pasa a minúsculas)
def normalize(song):
    song = song.strip().lower()
    song = ''.join(c for c in unicodedata.normalize('NFKD', song) if not unicodedata.combining(c) or c == 'ñ')
    return song

# Cargar los archivos JSON
with open(r'C:\Users\Yo\Desktop\setlist\SetlistFM-Setlist-Evolution\album_data\Los Piojos.json', 'r', encoding='utf-8') as f:
    albums_data = json.load(f)

with open('Setlists_Piojos.json', 'r', encoding='utf-8') as f:
    setlists_data = json.load(f)

# Crear diccionarios para mapear cada canción a su álbum y a su color
song_to_album = {}
song_to_color = {}
for album in albums_data.get("albums", []):
    album_title = album.get("title", "Ineditos")
    color = album.get("color", "gray")
    for track in album.get("tracks", []):
        norm_track = normalize(track)
        # Si la canción aparece en varios álbumes, se asigna el primero encontrado
        if norm_track not in song_to_album:
            song_to_album[norm_track] = album_title
            song_to_color[norm_track] = color

# Crear un diccionario que mapea cada álbum a su color en formato HEX
album_to_color = {}
for album in albums_data.get("albums", []):
    album_to_color[album.get("title", "Ineditos")] = album.get("color", "#39df00")


# Ordenar los setlists por fecha (usando year, month, day)
setlists_data.sort(key=lambda s: date(s["year"], s["month"], s["day"]))

# Procesar cada setlist y contar acumulativamente
records = []
cumulative_counts = {}

for setlist in setlists_data:
    # Crear fecha en formato ISO
    current_date = date(setlist["year"], setlist["month"], setlist["day"]).isoformat()
    
    # Procesar la lista de canciones, separando por "/" si es necesario
    canciones_raw = setlist.get("songs", [])
    canciones = []
    for item in canciones_raw:
        for part in item.split('/'):
            if part.strip():
                canciones.append(part.strip())
    
    # Actualizar los conteos acumulados
    for song in canciones:
        norm_song = normalize(song)
        cumulative_counts[norm_song] = cumulative_counts.get(norm_song, 0) + 1
    # Registrar el estado acumulado hasta la fecha actual
    for song, count in cumulative_counts.items():
        album = song_to_album.get(song, "Ineditos")
        color = song_to_color.get(song, "#000000")
        records.append({
            "fecha": current_date,
            "canción": song.title(),  # Capitalizamos para visualización
            "álbum": album,
            "color": color,
            "veces_tocada": count,

        })

# Crear DataFrame y agrupar para quedarnos con el último conteo de cada fecha
df = pd.DataFrame(records)


# Diccionario de colores corregido
colores_album = {
    "Ay Ay Ay": "#c41616",
    "3er Arco": "#ead936",
    "Chac Tu Chac": "#1e2830",
    "Azul": "#0047a5",
    "Verde Paisaje del Infierno": "#648e5c",
    "Maquina de Sangre": "#d57f5c",
    "Civilizacion": "#d7c391",
    "Ineditos": "#b3b3b3"
}

# Reemplazar los valores incorrectos en la columna 'color'
df["color"] = df["álbum"].map(colores_album)
df["álbum"] = df["álbum"].astype("category")

# Crear un DataFrame con todas las canciones en la fecha inicial con 0 reproducciones
fecha_inicio = df["fecha"].min()
df_inicio = df.copy()
df_inicio["fecha"] = fecha_inicio  # Asigna la fecha inicial
df_inicio["veces_tocada"] = 0      # Todas las canciones con 0

# Concatenamos con el DataFrame original
df_final = pd.concat([df_inicio, df], ignore_index=True)
```
:::

::: {#69c0f8e1 .cell .code execution_count="141"}
``` python
df_final
```

::: {.output .execute_result execution_count="141"}
```{=html}
<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>fecha</th>
      <th>canción</th>
      <th>álbum</th>
      <th>color</th>
      <th>veces_tocada</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>1991-09-21</td>
      <td>Blues Del Gato Sarnoso</td>
      <td>Ineditos</td>
      <td>#b3b3b3</td>
      <td>0</td>
    </tr>
    <tr>
      <th>1</th>
      <td>1991-09-21</td>
      <td>Los Mocosos</td>
      <td>Chac Tu Chac</td>
      <td>#1e2830</td>
      <td>0</td>
    </tr>
    <tr>
      <th>2</th>
      <td>1991-09-21</td>
      <td>Blues Del Traje Gris</td>
      <td>Chac Tu Chac</td>
      <td>#1e2830</td>
      <td>0</td>
    </tr>
    <tr>
      <th>3</th>
      <td>1991-09-21</td>
      <td>Chac Tu Chac</td>
      <td>Chac Tu Chac</td>
      <td>#1e2830</td>
      <td>0</td>
    </tr>
    <tr>
      <th>4</th>
      <td>1991-09-21</td>
      <td>Babilonia</td>
      <td>Ay Ay Ay</td>
      <td>#c41616</td>
      <td>0</td>
    </tr>
    <tr>
      <th>...</th>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
    </tr>
    <tr>
      <th>55423</th>
      <td>2025-05-25</td>
      <td>Superstition</td>
      <td>Ineditos</td>
      <td>#b3b3b3</td>
      <td>3</td>
    </tr>
    <tr>
      <th>55424</th>
      <td>2025-05-25</td>
      <td>Sabado Noche</td>
      <td>Ineditos</td>
      <td>#b3b3b3</td>
      <td>1</td>
    </tr>
    <tr>
      <th>55425</th>
      <td>2025-05-25</td>
      <td>¡Me Matan Limon!</td>
      <td>Ineditos</td>
      <td>#b3b3b3</td>
      <td>1</td>
    </tr>
    <tr>
      <th>55426</th>
      <td>2025-05-25</td>
      <td>Juana Azurduy</td>
      <td>Ineditos</td>
      <td>#b3b3b3</td>
      <td>3</td>
    </tr>
    <tr>
      <th>55427</th>
      <td>2025-05-25</td>
      <td>Marcha De San Lorenzo</td>
      <td>Ineditos</td>
      <td>#b3b3b3</td>
      <td>1</td>
    </tr>
  </tbody>
</table>
<p>55428 rows × 5 columns</p>
</div>
```
:::
:::

::: {#8ac67605 .cell .code execution_count="142"}
``` python
df_canciones = pd.DataFrame(albums_data["albums"])
df_canciones = df_canciones.explode('tracks').reset_index(drop=True)

df_canciones
```

::: {.output .execute_result execution_count="142"}
```{=html}
<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>title</th>
      <th>color</th>
      <th>tracks</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>Chac Tu Chac</td>
      <td>#1e2830</td>
      <td>Llévatelo</td>
    </tr>
    <tr>
      <th>1</th>
      <td>Chac Tu Chac</td>
      <td>#1e2830</td>
      <td>Chac Tu Chac</td>
    </tr>
    <tr>
      <th>2</th>
      <td>Chac Tu Chac</td>
      <td>#1e2830</td>
      <td>Tan Solo</td>
    </tr>
    <tr>
      <th>3</th>
      <td>Chac Tu Chac</td>
      <td>#1e2830</td>
      <td>Cancheros</td>
    </tr>
    <tr>
      <th>4</th>
      <td>Chac Tu Chac</td>
      <td>#1e2830</td>
      <td>Los Mocosos</td>
    </tr>
    <tr>
      <th>...</th>
      <td>...</td>
      <td>...</td>
      <td>...</td>
    </tr>
    <tr>
      <th>155</th>
      <td>Ineditos</td>
      <td>#d57f5c</td>
      <td>Silver Moon</td>
    </tr>
    <tr>
      <th>156</th>
      <td>Ineditos</td>
      <td>#d57f5c</td>
      <td>Superstition</td>
    </tr>
    <tr>
      <th>157</th>
      <td>Ineditos</td>
      <td>#d57f5c</td>
      <td>Sábado a la Noche</td>
    </tr>
    <tr>
      <th>158</th>
      <td>Ineditos</td>
      <td>#d57f5c</td>
      <td>Juana Azurduy</td>
    </tr>
    <tr>
      <th>159</th>
      <td>Ineditos</td>
      <td>#d57f5c</td>
      <td>Marcha De San Lorenzo</td>
    </tr>
  </tbody>
</table>
<p>160 rows × 3 columns</p>
</div>
```
:::
:::

::: {#3d28d8cf .cell .code execution_count="143"}
``` python
# Para cada canción, obtener la fila con el máximo 'veces_tocada' (último conteo acumulado)
idx = df_final.groupby("canción")["veces_tocada"].idxmax()
df_final_max = df_final.loc[idx].reset_index(drop=True)

df_final_max['canción'] = df_final_max['canción'].apply(lambda x: x.title())  # Capitalizar nombres de canciones
df_final_max['canción'] = df_final_max['canción'].apply(normalize)  # Normalizar nombres de canciones
df_final_max

```

::: {.output .execute_result execution_count="143"}
```{=html}
<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>fecha</th>
      <th>canción</th>
      <th>álbum</th>
      <th>color</th>
      <th>veces_tocada</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>2000-07-09</td>
      <td>a la huella</td>
      <td>Ineditos</td>
      <td>#b3b3b3</td>
      <td>1</td>
    </tr>
    <tr>
      <th>1</th>
      <td>2024-12-21</td>
      <td>a veces</td>
      <td>Chac Tu Chac</td>
      <td>#1e2830</td>
      <td>23</td>
    </tr>
    <tr>
      <th>2</th>
      <td>2008-12-11</td>
      <td>a ver cuando</td>
      <td>Azul</td>
      <td>#0047a5</td>
      <td>9</td>
    </tr>
    <tr>
      <th>3</th>
      <td>2025-05-03</td>
      <td>agua</td>
      <td>Azul</td>
      <td>#0047a5</td>
      <td>57</td>
    </tr>
    <tr>
      <th>4</th>
      <td>2006-08-24</td>
      <td>al atardecer</td>
      <td>3er Arco</td>
      <td>#ead936</td>
      <td>11</td>
    </tr>
    <tr>
      <th>...</th>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
    </tr>
    <tr>
      <th>156</th>
      <td>2025-05-03</td>
      <td>y quemas</td>
      <td>Azul</td>
      <td>#0047a5</td>
      <td>31</td>
    </tr>
    <tr>
      <th>157</th>
      <td>2025-05-03</td>
      <td>yira yira</td>
      <td>Chac Tu Chac</td>
      <td>#1e2830</td>
      <td>58</td>
    </tr>
    <tr>
      <th>158</th>
      <td>2025-04-24</td>
      <td>you gotta move</td>
      <td>Ineditos</td>
      <td>#b3b3b3</td>
      <td>3</td>
    </tr>
    <tr>
      <th>159</th>
      <td>2025-01-25</td>
      <td>zapatos de gamuza azul</td>
      <td>Ineditos</td>
      <td>#b3b3b3</td>
      <td>35</td>
    </tr>
    <tr>
      <th>160</th>
      <td>2025-04-24</td>
      <td>¡me matan limon!</td>
      <td>Ineditos</td>
      <td>#b3b3b3</td>
      <td>1</td>
    </tr>
  </tbody>
</table>
<p>161 rows × 5 columns</p>
</div>
```
:::
:::

::: {#a8eded8c .cell .code execution_count="144"}
``` python
# Obtener la primera fecha donde se tocó cada canción (veces_tocada > 0)
primeras_fechas = (
    df_final[df_final['veces_tocada'] > 0]
    .groupby('canción')['fecha']
    .min()
    .reset_index()
    .rename(columns={'fecha': 'primer_fecha'})
)

primeras_fechas
```

::: {.output .execute_result execution_count="144"}
```{=html}
<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>canción</th>
      <th>primer_fecha</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>A La Huella</td>
      <td>2000-07-09</td>
    </tr>
    <tr>
      <th>1</th>
      <td>A Veces</td>
      <td>1992-11-14</td>
    </tr>
    <tr>
      <th>2</th>
      <td>A Ver Cuando</td>
      <td>1998-05-16</td>
    </tr>
    <tr>
      <th>3</th>
      <td>Agua</td>
      <td>1997-07-18</td>
    </tr>
    <tr>
      <th>4</th>
      <td>Al Atardecer</td>
      <td>1996-09-28</td>
    </tr>
    <tr>
      <th>...</th>
      <td>...</td>
      <td>...</td>
    </tr>
    <tr>
      <th>156</th>
      <td>Y Quemas</td>
      <td>1998-05-17</td>
    </tr>
    <tr>
      <th>157</th>
      <td>Yira Yira</td>
      <td>1991-09-21</td>
    </tr>
    <tr>
      <th>158</th>
      <td>You Gotta Move</td>
      <td>1991-09-21</td>
    </tr>
    <tr>
      <th>159</th>
      <td>Zapatos De Gamuza Azul</td>
      <td>1992-11-14</td>
    </tr>
    <tr>
      <th>160</th>
      <td>¡Me Matan Limon!</td>
      <td>2025-04-24</td>
    </tr>
  </tbody>
</table>
<p>161 rows × 2 columns</p>
</div>
```
:::
:::

::: {#140417da .cell .code execution_count="145"}
``` python

df_final_max[df_final_max['canción'] == 'llevatelo']
```

::: {.output .execute_result execution_count="145"}
```{=html}
<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>fecha</th>
      <th>canción</th>
      <th>álbum</th>
      <th>color</th>
      <th>veces_tocada</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>86</th>
      <td>2025-05-25</td>
      <td>llevatelo</td>
      <td>Chac Tu Chac</td>
      <td>#1e2830</td>
      <td>45</td>
    </tr>
  </tbody>
</table>
</div>
```
:::
:::

::: {#cee1f964 .cell .code execution_count="146"}
``` python
df_canciones = df_canciones.rename(columns={"tracks": "canción"})
df_canciones = df_canciones.rename(columns={"title": "álbum"})
df_canciones = df_canciones.rename(columns={"color": "color_álbum"})
df_canciones['canción'] = df_canciones['canción'].apply(lambda x: x.title())  # Capitalizar nombres de canciones
df_canciones['canción'] = df_canciones['canción'].apply(normalize)  # Normalizar nombres de canciones

df_canciones = df_canciones.merge(df_final_max, on=["canción", "álbum"], how="left")
```
:::

::: {#1a8974c1 .cell .code execution_count="147"}
``` python
df_canciones['canción'] = df_canciones['canción'].str.title()
df_canciones
```

::: {.output .execute_result execution_count="147"}
```{=html}
<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>álbum</th>
      <th>color_álbum</th>
      <th>canción</th>
      <th>fecha</th>
      <th>color</th>
      <th>veces_tocada</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>Chac Tu Chac</td>
      <td>#1e2830</td>
      <td>Llevatelo</td>
      <td>2025-05-25</td>
      <td>#1e2830</td>
      <td>45.0</td>
    </tr>
    <tr>
      <th>1</th>
      <td>Chac Tu Chac</td>
      <td>#1e2830</td>
      <td>Chac Tu Chac</td>
      <td>2025-04-13</td>
      <td>#1e2830</td>
      <td>67.0</td>
    </tr>
    <tr>
      <th>2</th>
      <td>Chac Tu Chac</td>
      <td>#1e2830</td>
      <td>Tan Solo</td>
      <td>2025-05-25</td>
      <td>#1e2830</td>
      <td>126.0</td>
    </tr>
    <tr>
      <th>3</th>
      <td>Chac Tu Chac</td>
      <td>#1e2830</td>
      <td>Cancheros</td>
      <td>2025-04-26</td>
      <td>#1e2830</td>
      <td>27.0</td>
    </tr>
    <tr>
      <th>4</th>
      <td>Chac Tu Chac</td>
      <td>#1e2830</td>
      <td>Los Mocosos</td>
      <td>2025-05-03</td>
      <td>#1e2830</td>
      <td>46.0</td>
    </tr>
    <tr>
      <th>...</th>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
    </tr>
    <tr>
      <th>155</th>
      <td>Ineditos</td>
      <td>#d57f5c</td>
      <td>Silver Moon</td>
      <td>2008-11-08</td>
      <td>#b3b3b3</td>
      <td>1.0</td>
    </tr>
    <tr>
      <th>156</th>
      <td>Ineditos</td>
      <td>#d57f5c</td>
      <td>Superstition</td>
      <td>2009-04-04</td>
      <td>#b3b3b3</td>
      <td>3.0</td>
    </tr>
    <tr>
      <th>157</th>
      <td>Ineditos</td>
      <td>#d57f5c</td>
      <td>Sabado Noche</td>
      <td>2025-04-13</td>
      <td>#b3b3b3</td>
      <td>1.0</td>
    </tr>
    <tr>
      <th>158</th>
      <td>Ineditos</td>
      <td>#d57f5c</td>
      <td>Juana Azurduy</td>
      <td>2025-05-25</td>
      <td>#b3b3b3</td>
      <td>3.0</td>
    </tr>
    <tr>
      <th>159</th>
      <td>Ineditos</td>
      <td>#d57f5c</td>
      <td>Marcha De San Lorenzo</td>
      <td>2025-05-24</td>
      <td>#b3b3b3</td>
      <td>1.0</td>
    </tr>
  </tbody>
</table>
<p>160 rows × 6 columns</p>
</div>
```
:::
:::

::: {#5694fd2d .cell .code execution_count="148"}
``` python
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials

# Configura tus credenciales de Spotify
sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(
    client_id='f08cac877ee344a39c4e3b8044a467bc',
    client_secret='b70dee3e801f4a71b0282f39383cc4f1'
))

'''def get_spotify_plays(song, artist="Los Piojos"):
    query = f"track:{song} artist:{artist}"
    results = sp.search(q=query, type='track', limit=1)
    items = results['tracks']['items']
    if items:
        return items[0]['popularity']  # No hay plays exactos, pero sí popularidad (0-100)
    return None'''

def get_spotify_plays(song, artist="Los Piojos"):
    """
    Busca la popularidad de una canción en Spotify.
    Si no encuentra con el artista principal, prueba solo por nombre de canción.
    Si tampoco encuentra, intenta buscar sin artista (puede ser cover o versión).
    Devuelve None si no encuentra ningún resultado.
    """
    # 1. Busca con artista principal
    query = f"track:{song} artist:{artist}"
    results = sp.search(q=query, type='track', limit=1)
    items = results['tracks']['items']
    if items:
        return items[0]['popularity']
    # 2. Busca solo por nombre de canción (puede ser cover, versión, etc.)
    results = sp.search(q=f"track:{song}", type='track', limit=1)
    items = results['tracks']['items']
    if items:
        return items[0]['popularity']
    # 3. Busca por nombre exacto (sin filtro de tipo)
    results = sp.search(q=song, type='track', limit=1)
    items = results['tracks']['items']
    if items:
        return items[0]['popularity']
    # No encontrado
    return None

df_canciones['spotify_popularity'] = df_canciones['canción'].apply(get_spotify_plays)
```
:::

::: {#74c2780f .cell .code execution_count="149"}
``` python
df_canciones['spotify_popularity'].median()
```

::: {.output .execute_result execution_count="149"}
    45.0
:::
:::

::: {#5b57c923 .cell .code execution_count="150"}
``` python
import yt_dlp
import pandas as pd

def get_youtube_views(query, n=5):
    ydl_opts = {
        'quiet': True,
        'skip_download': True,
        'extract_flat': 'in_playlist',
        'default_search': f'ytsearch{n}',
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            info = ydl.extract_info(query, download=False)
            if 'entries' in info and info['entries']:
                # Suma las vistas de los primeros n videos
                total_views = sum(entry.get('view_count', 0) for entry in info['entries'][:n])
                return total_views
        except Exception:
            return None
    return None

# Ahora buscará los primeros 5 videos y sumará sus vistas
df_canciones['reprod_youtube'] = df_canciones.apply(
    lambda row: get_youtube_views(f"{row['canción']} Los Piojos", n=3), axis=1
)
```
:::

::: {#ccb1f73d .cell .code execution_count="151"}
``` python
df_canciones
```

::: {.output .execute_result execution_count="151"}
```{=html}
<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>álbum</th>
      <th>color_álbum</th>
      <th>canción</th>
      <th>fecha</th>
      <th>color</th>
      <th>veces_tocada</th>
      <th>spotify_popularity</th>
      <th>reprod_youtube</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>Chac Tu Chac</td>
      <td>#1e2830</td>
      <td>Llevatelo</td>
      <td>2025-05-25</td>
      <td>#1e2830</td>
      <td>45.0</td>
      <td>46</td>
      <td>989350</td>
    </tr>
    <tr>
      <th>1</th>
      <td>Chac Tu Chac</td>
      <td>#1e2830</td>
      <td>Chac Tu Chac</td>
      <td>2025-04-13</td>
      <td>#1e2830</td>
      <td>67.0</td>
      <td>50</td>
      <td>1162120</td>
    </tr>
    <tr>
      <th>2</th>
      <td>Chac Tu Chac</td>
      <td>#1e2830</td>
      <td>Tan Solo</td>
      <td>2025-05-25</td>
      <td>#1e2830</td>
      <td>126.0</td>
      <td>69</td>
      <td>15922263</td>
    </tr>
    <tr>
      <th>3</th>
      <td>Chac Tu Chac</td>
      <td>#1e2830</td>
      <td>Cancheros</td>
      <td>2025-04-26</td>
      <td>#1e2830</td>
      <td>27.0</td>
      <td>45</td>
      <td>584696</td>
    </tr>
    <tr>
      <th>4</th>
      <td>Chac Tu Chac</td>
      <td>#1e2830</td>
      <td>Los Mocosos</td>
      <td>2025-05-03</td>
      <td>#1e2830</td>
      <td>46.0</td>
      <td>49</td>
      <td>1962612</td>
    </tr>
    <tr>
      <th>...</th>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
    </tr>
    <tr>
      <th>155</th>
      <td>Ineditos</td>
      <td>#d57f5c</td>
      <td>Silver Moon</td>
      <td>2008-11-08</td>
      <td>#b3b3b3</td>
      <td>1.0</td>
      <td>37</td>
      <td>47018953</td>
    </tr>
    <tr>
      <th>156</th>
      <td>Ineditos</td>
      <td>#d57f5c</td>
      <td>Superstition</td>
      <td>2009-04-04</td>
      <td>#b3b3b3</td>
      <td>3.0</td>
      <td>77</td>
      <td>9150</td>
    </tr>
    <tr>
      <th>157</th>
      <td>Ineditos</td>
      <td>#d57f5c</td>
      <td>Sabado Noche</td>
      <td>2025-04-13</td>
      <td>#b3b3b3</td>
      <td>1.0</td>
      <td>41</td>
      <td>2435142</td>
    </tr>
    <tr>
      <th>158</th>
      <td>Ineditos</td>
      <td>#d57f5c</td>
      <td>Juana Azurduy</td>
      <td>2025-05-25</td>
      <td>#b3b3b3</td>
      <td>3.0</td>
      <td>29</td>
      <td>1916185</td>
    </tr>
    <tr>
      <th>159</th>
      <td>Ineditos</td>
      <td>#d57f5c</td>
      <td>Marcha De San Lorenzo</td>
      <td>2025-05-24</td>
      <td>#b3b3b3</td>
      <td>1.0</td>
      <td>30</td>
      <td>8065490</td>
    </tr>
  </tbody>
</table>
<p>160 rows × 8 columns</p>
</div>
```
:::
:::

::: {#b6a07cfa .cell .code execution_count="152"}
``` python
data = '''
Song Title	Streams	Daily
Tan Solo 102,268,899	79,506
Bicho de Ciudad 64,948,157	69,354
El Farolito 64,352,521	66,936
Como Alí 47,591,515	46,178
Ruleta 45,015,653	41,330
Ando Ganas (Llora Llora) 42,467,530	28,109
Verano del 92 37,892,518	28,255
Todo Pasa 31,649,085	21,513
Civilización 28,167,736	21,715
Vine Hasta Aquí 21,854,601	31,423
Canción de Cuna 20,178,108	13,662
Pacífico 19,232,459	19,372
Desde Lejos No Se Ve 17,583,199	23,000
Muy Despacito 16,249,568	11,006
Amor de Perros 16,040,522	7,199
Pistolas 14,308,552	19,240
Muévelo 12,512,312	13,040
Agua 11,295,121	10,494
El Balneario de los Doctores Crotos 10,686,329	10,927
Yira Yira 10,461,357	9,075
Al Atardecer 8,899,107	3,939
Taxi Boy 8,733,004	12,167
Te Diría 8,611,297	13,011
Marado 8,308,121	8,081
Y Quemás 6,045,849	4,522
Difícil 5,899,333	11,231
Esquina Libertad 5,862,629	5,952
Babilonia 5,047,786	8,549
Luz de Marfil 4,887,935	9,425
Cruel 4,844,211	6,364
Buenos Tiempos 4,484,190	8,422
Arco 4,443,314	6,219
Genius 4,166,304	6,029
Dientes de Cordero 4,154,862	4,356
Sudestada 4,144,062	9,250
Los Mocosos 4,075,659	4,807
Ay Ay Ay 3,953,398	4,026
Fantasma 3,908,783	5,963
Chac Tu Chac 3,809,631	5,654
Shup Shup 3,469,845	3,951
Pensar en Nada 3,365,805	1,285
Tan Solo 3,307,141	1,790
La Luna y la Cabra 3,241,404	5,514
Fijate 3,205,038	2,487
Basta de Penas 3,026,720	3,655
Morella 2,952,514	6,699
Labios de Seda 2,906,677	3,684
A Veces 2,797,426	5,654
Gris 2,586,045	1,531
Llevátelo 2,525,463	3,754
Buenos Días Palomar 2,524,614	2,426
Manjar 2,444,019	2,664
Angelito 2,396,411	3,589
Intro Marado 2,375,751	1,369
A Ver Cuando 2,208,234	2,834
Que Decís 2,202,626	1,506
Hoy es Hoy 2,044,482	3,899
Fumigator 2,023,695	3,445
Cancheros 1,990,564	3,712
Don't Say Tomorrow 1,951,824	3,153
Entrando en Tu Ciudad 1,950,431	2,575
María y José 1,939,651	4,325
Uoh Pa Pa Pa 1,889,845	1,650
Quemado 1,868,693	1,273
Te Diría - En Vivo 1,818,573	967
Media Caña 1,743,210	2,162
Murguita 1,685,532	2,544
Agua 1,621,718	689
Manise 1,621,104	2,187
Es Sentir 1,595,436	1,934
Chac Tu Chac 1,580,889	838
Fantasma - En Vivo 1,520,388	1,261
Finale 1,506,119	1,390
Siempre Bajando 1,500,029	1,880
Labios de Seda 1,488,049	3,299
Olvidate 1,452,986	2,009
Pollo Viejo 1,416,027	1,515
Go Negro Go 1,378,693	2,046
Guadalupe 1,330,033	1,471
Babilonia 1,329,910	1,927
Labios de Seda 1,318,750	584
Vals Inicial 1,315,486	4,364
Motumbo 1,299,141	3,552
El Rey del Blues 1,292,078	1,515
Sucio Can 1,261,600	1,141
Ximenita 1,240,467	1,210
Blues del Traje Gris 1,232,248	1,927
Te Diría 1,226,387	2,293
Cruces y Flores 1,221,919	1,406
Desde Lejos No Se Ve - En Vivo 1,165,587	701
Unbekannt 1,154,163	5,938
Pistolas - En Vivo 1,128,065	1,779
Reggae Rojo y Negro 1,122,759	2,034
Babilonia - En Vivo 1,121,689	792
Maradó - En Vivo 1,098,509	522
Un Buen Día 1,089,920	1,228
María y José 1,079,700	847
Manise 1,061,632	2,649
Globalización 1,056,355	1,494
Pacífico 1,048,527	2,674
Salitral 1,040,291	1,250
Arco II 1,039,861	1,508
Luz de Marfil 1,032,783	1,845
Ando Ganas (Llora Llora) 1,029,864	802
No Parés 983,051	1,412
Ando Ganas 966,945	1,847
Pega Pega 962,690	1,061
San Jauretche 952,499	1,676
Morella 908,638	557
Olvidate (Ya Ves) 889,774	944
Fijate 873,556	1,248
Angelito - En Vivo 858,149	423
Todo Pasa 846,078	708
Esquina Libertad 844,979	1,361
Manjar 828,211	2,457
Guadalupe - En Vivo 810,373	362
Todo Pasa 767,852	1,517
El Farolito (La Rubia Tarada) 754,193	993
Desde Lejos No Se Ve 746,310	883
Merecido 741,420	2,864
Langostas 741,358	1,854
Genius (El Mendigo de Dock Sud) 731,615	1,439
Muy Despacito 728,718	757
Ruleta - En Vivo 717,251	850
Sudestada 708,596	1,920
Difícil 706,985	1,903
Solo y en Paz 692,052	881
Al Desierto 691,832	931
Dientes de Cordero - En Vivo 684,180	455
Mi Babe 680,077	1,131
Luz de Marfil - En Vivo 671,681	1,223
Yira Yira 636,373	867
Y Que Más 607,535	764
Cruel 580,953	798
Desde Lejos No Se Ve 569,544	1,244
Cruel 564,243	1,364
Verano del 92 549,630	1,245
Ay Ay Ay 536,990	887
El Balneario de los Doctores Crotos 532,155	1,411
Llévatelo 531,318	1,157
Arco 524,446	716
El Balneario de los Doctores Crotos 523,482	628
Taxi Boy - En Vivo 518,633	568
Ruleta 514,351	1,283
Canción de Cuna 508,180	1,163
Todo Pasa - En Vivo 477,048	461
Amor de Perros - En Vivo 468,999	496
Buenos Días Palomar 456,421	932
Cruel - En Vivo 456,204	523
Taxi Boy 453,248	488
Morella - En Vivo 444,922	666
Los Mocosos 444,102	953
Ay Ay Ay - En Vivo 442,818	499
A Veces 440,905	502
Cancheros 435,339	676
Extraña Soledad 431,136	647
Muévelo 430,248	1,157
El Farolito - En Vivo 428,465	514
Maradó 424,765	388
Babilonia 418,808	514
Angelito 414,265	494
Como Alí - En Vivo 410,519	471
Motumbo - En Vivo 408,412	673
Canción de Cuna - En Vivo 403,387	307
Chac Tu Chac - En Vivo 398,555	391
Media Caña - En Vivo 393,209	542
Around & Around / Zapatos de Gamuza Azul 385,085	480
El Viejo 374,401	753
Tan Solo - En Vivo 368,692	491
Ximenita 365,615	471
Es Sólo Rock & Roll (It´s Only Rock & Roll) 359,986	876
Intro Maradó 348,670	290
Quemado - En Vivo 337,527	339
Fíjate 337,312	389
Fijate - En Vivo 313,879	335
El Viejo - En Vivo 308,636	290
Finale 299,962	603
El Rey del Blues (B. B. King) 296,340	329
Llevatelo - En Vivo 268,965	228
Langostas - En Vivo 259,955	563
No Pares - En Vivo 256,212	259
Little Red Rooster (Zapada) 191,721	219
'''
import re

rows = []
for line in data.strip().split('\n'):
    # Busca el nombre de la canción y el primer número (Streams)
    match = re.match(r"(.+?)\s+([\d,]+)\s+[\d,]+$", line.strip())
    if match:
        title = match.group(1)
        streams = match.group(2).replace(',', '')
        try:
            streams = int(streams)
        except:
            continue
        rows.append([title, streams])

df_streams = pd.DataFrame(rows, columns=['Song Title', 'Streams'])
df_streams[df_streams['Streams'] > 30000000]
```

::: {.output .execute_result execution_count="152"}
```{=html}
<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>Song Title</th>
      <th>Streams</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>Tan Solo</td>
      <td>102268899</td>
    </tr>
    <tr>
      <th>1</th>
      <td>Bicho de Ciudad</td>
      <td>64948157</td>
    </tr>
    <tr>
      <th>2</th>
      <td>El Farolito</td>
      <td>64352521</td>
    </tr>
    <tr>
      <th>3</th>
      <td>Como Alí</td>
      <td>47591515</td>
    </tr>
    <tr>
      <th>4</th>
      <td>Ruleta</td>
      <td>45015653</td>
    </tr>
    <tr>
      <th>5</th>
      <td>Ando Ganas (Llora Llora)</td>
      <td>42467530</td>
    </tr>
    <tr>
      <th>6</th>
      <td>Verano del 92</td>
      <td>37892518</td>
    </tr>
    <tr>
      <th>7</th>
      <td>Todo Pasa</td>
      <td>31649085</td>
    </tr>
  </tbody>
</table>
</div>
```
:::
:::

::: {#27c98e23 .cell .code execution_count="153"}
``` python

import unicodedata

def normalize(song):
    song = song.strip().lower()
    song = song.replace("á", "a").replace("é", "e").replace("í", "i").replace("ó", "o").replace("ú", "u").replace("ñ", "n")
    song = song.replace("-", " ").replace("'", "").replace("’", "")
    song = song.replace("(", "").replace(")", "").replace("[", "").replace("]", "")
    song = song.replace(",", " ").replace(";", " ").replace(":", " ")
    song = ''.join(c for c in unicodedata.normalize('NFKD', song) if not unicodedata.combining(c))
    song = song.replace(" en vivo", "").replace("(la rubia tarada)", "").replace("(b. b. king)", "").replace("(zapada)", "")
    song = song.replace("(el mendigo de dock sud)", "")
    song = song.replace("  ", " ").strip()
    return song

# Canciones de tu df (normalizadas)
canciones_df = [normalize(c) for c in df_canciones['canción'].unique()]
```
:::

::: {#5a56ce87 .cell .code execution_count="154"}
``` python
# Normaliza y agrupa las reproducciones de df_streams
from collections import defaultdict

repro_sum = defaultdict(int)
for _, row in df_streams.iterrows():
    norm = normalize(row['Song Title'])
    repro_sum[norm] += row['Streams']
```
:::

::: {#04028933 .cell .code execution_count="155"}
``` python
# Crea la lista final solo con las canciones de tu df
data_filtrada = []
for c in canciones_df:
    if c in repro_sum:
        data_filtrada.append([c.title(), repro_sum[c]])
```
:::

::: {#595c46ca .cell .code execution_count="156"}
``` python
df = pd.DataFrame(data_filtrada, columns=["canción", "reproducciones_spotify"])


df
```

::: {.output .execute_result execution_count="156"}
```{=html}
<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>canción</th>
      <th>reproducciones_spotify</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>Llevatelo</td>
      <td>3325746</td>
    </tr>
    <tr>
      <th>1</th>
      <td>Chac Tu Chac</td>
      <td>5789075</td>
    </tr>
    <tr>
      <th>2</th>
      <td>Tan Solo</td>
      <td>105944732</td>
    </tr>
    <tr>
      <th>3</th>
      <td>Cancheros</td>
      <td>2425903</td>
    </tr>
    <tr>
      <th>4</th>
      <td>Los Mocosos</td>
      <td>4519761</td>
    </tr>
    <tr>
      <th>...</th>
      <td>...</td>
      <td>...</td>
    </tr>
    <tr>
      <th>92</th>
      <td>Buenos Dias Palomar</td>
      <td>2981035</td>
    </tr>
    <tr>
      <th>93</th>
      <td>Olvidate Ya Ves</td>
      <td>889774</td>
    </tr>
    <tr>
      <th>94</th>
      <td>Extrana Soledad</td>
      <td>431136</td>
    </tr>
    <tr>
      <th>95</th>
      <td>Pensar En Nada</td>
      <td>3365805</td>
    </tr>
    <tr>
      <th>96</th>
      <td>El Viejo</td>
      <td>683037</td>
    </tr>
  </tbody>
</table>
<p>97 rows × 2 columns</p>
</div>
```
:::
:::

::: {#a914d6b4 .cell .code execution_count="157"}
``` python
# Crea columna auxiliar normalizada en ambos DataFrames
df_canciones['cancion_norm'] = df_canciones['canción'].apply(normalize)

df['cancion_norm'] = df['canción'].apply(normalize)

# Merge usando la columna normalizada
df_canciones = df_canciones.merge(df[['cancion_norm', 'reproducciones_spotify']], on='cancion_norm', how='left')

# Elimina la columna auxiliar si no la necesitas
df_canciones = df_canciones.drop(columns=['cancion_norm'])
```
:::

::: {#9e77fd68 .cell .code execution_count="158"}
``` python
# Aplicar a cada álbum una nueva columna con el número de ventas del álbum
df_canciones['ventas'] = df_canciones['álbum'].map({
    "Ay Ay Ay": 60000,
    "3er Arco": 360000,
    "Chac Tu Chac": 60000,
    "Azul": 120000,
    "Verde Paisaje del Infierno": 120000,
    "Maquina de Sangre": 80000,
    "Civilizacion": 80000,
    "Ineditos": 80000
})
```
:::

::: {#386145e3 .cell .code execution_count="159"}
``` python
df_canciones
```

::: {.output .execute_result execution_count="159"}
```{=html}
<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>álbum</th>
      <th>color_álbum</th>
      <th>canción</th>
      <th>fecha</th>
      <th>color</th>
      <th>veces_tocada</th>
      <th>spotify_popularity</th>
      <th>reprod_youtube</th>
      <th>reproducciones_spotify</th>
      <th>ventas</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>Chac Tu Chac</td>
      <td>#1e2830</td>
      <td>Llevatelo</td>
      <td>2025-05-25</td>
      <td>#1e2830</td>
      <td>45.0</td>
      <td>46</td>
      <td>989350</td>
      <td>3325746.0</td>
      <td>60000</td>
    </tr>
    <tr>
      <th>1</th>
      <td>Chac Tu Chac</td>
      <td>#1e2830</td>
      <td>Chac Tu Chac</td>
      <td>2025-04-13</td>
      <td>#1e2830</td>
      <td>67.0</td>
      <td>50</td>
      <td>1162120</td>
      <td>5789075.0</td>
      <td>60000</td>
    </tr>
    <tr>
      <th>2</th>
      <td>Chac Tu Chac</td>
      <td>#1e2830</td>
      <td>Tan Solo</td>
      <td>2025-05-25</td>
      <td>#1e2830</td>
      <td>126.0</td>
      <td>69</td>
      <td>15922263</td>
      <td>105944732.0</td>
      <td>60000</td>
    </tr>
    <tr>
      <th>3</th>
      <td>Chac Tu Chac</td>
      <td>#1e2830</td>
      <td>Cancheros</td>
      <td>2025-04-26</td>
      <td>#1e2830</td>
      <td>27.0</td>
      <td>45</td>
      <td>584696</td>
      <td>2425903.0</td>
      <td>60000</td>
    </tr>
    <tr>
      <th>4</th>
      <td>Chac Tu Chac</td>
      <td>#1e2830</td>
      <td>Los Mocosos</td>
      <td>2025-05-03</td>
      <td>#1e2830</td>
      <td>46.0</td>
      <td>49</td>
      <td>1962612</td>
      <td>4519761.0</td>
      <td>60000</td>
    </tr>
    <tr>
      <th>...</th>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
    </tr>
    <tr>
      <th>155</th>
      <td>Ineditos</td>
      <td>#d57f5c</td>
      <td>Silver Moon</td>
      <td>2008-11-08</td>
      <td>#b3b3b3</td>
      <td>1.0</td>
      <td>37</td>
      <td>47018953</td>
      <td>NaN</td>
      <td>80000</td>
    </tr>
    <tr>
      <th>156</th>
      <td>Ineditos</td>
      <td>#d57f5c</td>
      <td>Superstition</td>
      <td>2009-04-04</td>
      <td>#b3b3b3</td>
      <td>3.0</td>
      <td>77</td>
      <td>9150</td>
      <td>NaN</td>
      <td>80000</td>
    </tr>
    <tr>
      <th>157</th>
      <td>Ineditos</td>
      <td>#d57f5c</td>
      <td>Sabado Noche</td>
      <td>2025-04-13</td>
      <td>#b3b3b3</td>
      <td>1.0</td>
      <td>41</td>
      <td>2435142</td>
      <td>NaN</td>
      <td>80000</td>
    </tr>
    <tr>
      <th>158</th>
      <td>Ineditos</td>
      <td>#d57f5c</td>
      <td>Juana Azurduy</td>
      <td>2025-05-25</td>
      <td>#b3b3b3</td>
      <td>3.0</td>
      <td>29</td>
      <td>1916185</td>
      <td>NaN</td>
      <td>80000</td>
    </tr>
    <tr>
      <th>159</th>
      <td>Ineditos</td>
      <td>#d57f5c</td>
      <td>Marcha De San Lorenzo</td>
      <td>2025-05-24</td>
      <td>#b3b3b3</td>
      <td>1.0</td>
      <td>30</td>
      <td>8065490</td>
      <td>NaN</td>
      <td>80000</td>
    </tr>
  </tbody>
</table>
<p>160 rows × 10 columns</p>
</div>
```
:::
:::

::: {#65e5028d .cell .code execution_count="160"}
``` python
# Supón que tienes el año de lanzamiento en una columna 'año_lanzamiento'
import datetime
# Si tienes df_final con todas las canciones y fechas
# Ahora puedes recalcular años_vigencia normalmente
# Aplicar a cada álbum una nueva columna con el número de ventas del álbum
df_canciones['año_lanzamiento'] = df_canciones['álbum'].map(
    {
    "Ay Ay Ay": 1994,
    "3er Arco": 1996,
    "Chac Tu Chac": 1992,
    "Azul": 1998,
    "Verde Paisaje del Infierno": 2000,
    "Maquina de Sangre": 2003,
    "Civilizacion": 2007
}
)

ineditos = df_canciones[df_canciones['álbum'] == 'Ineditos']['canción'].unique()
for cancion in ineditos:
    fechas = primeras_fechas[primeras_fechas['canción'] == cancion]['primer_fecha']
    if not fechas.empty:
        año_primera = int(fechas.min()[:4])
        df_canciones.loc[(df_canciones['canción'] == cancion) & (df_canciones['álbum'] == 'Ineditos'), 'año_lanzamiento'] = año_primera
    else:
        df_canciones.loc[(df_canciones['canción'] == cancion) & (df_canciones['álbum'] == 'Ineditos'), 'año_lanzamiento'] = 1991  # fallback




año_actual = datetime.datetime.now().year

# Si quieres restar 15 años solo a canciones lanzadas antes de 2024, usa np.where
import numpy as np
df_canciones['años_vigencia'] = np.where(
    df_canciones['año_lanzamiento'] < 2024,
    año_actual - df_canciones['año_lanzamiento'] - 15,
    abs(año_actual - df_canciones['año_lanzamiento'] - 1)
)
# años de separación

# Nueva métrica: veces tocada por año de vigencia
df_canciones['veces_tocada_por_año'] = df_canciones['veces_tocada'] / df_canciones['años_vigencia']

df_canciones
```

::: {.output .execute_result execution_count="160"}
```{=html}
<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>álbum</th>
      <th>color_álbum</th>
      <th>canción</th>
      <th>fecha</th>
      <th>color</th>
      <th>veces_tocada</th>
      <th>spotify_popularity</th>
      <th>reprod_youtube</th>
      <th>reproducciones_spotify</th>
      <th>ventas</th>
      <th>año_lanzamiento</th>
      <th>años_vigencia</th>
      <th>veces_tocada_por_año</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>Chac Tu Chac</td>
      <td>#1e2830</td>
      <td>Llevatelo</td>
      <td>2025-05-25</td>
      <td>#1e2830</td>
      <td>45.0</td>
      <td>46</td>
      <td>989350</td>
      <td>3325746.0</td>
      <td>60000</td>
      <td>1992.0</td>
      <td>18.0</td>
      <td>2.500000</td>
    </tr>
    <tr>
      <th>1</th>
      <td>Chac Tu Chac</td>
      <td>#1e2830</td>
      <td>Chac Tu Chac</td>
      <td>2025-04-13</td>
      <td>#1e2830</td>
      <td>67.0</td>
      <td>50</td>
      <td>1162120</td>
      <td>5789075.0</td>
      <td>60000</td>
      <td>1992.0</td>
      <td>18.0</td>
      <td>3.722222</td>
    </tr>
    <tr>
      <th>2</th>
      <td>Chac Tu Chac</td>
      <td>#1e2830</td>
      <td>Tan Solo</td>
      <td>2025-05-25</td>
      <td>#1e2830</td>
      <td>126.0</td>
      <td>69</td>
      <td>15922263</td>
      <td>105944732.0</td>
      <td>60000</td>
      <td>1992.0</td>
      <td>18.0</td>
      <td>7.000000</td>
    </tr>
    <tr>
      <th>3</th>
      <td>Chac Tu Chac</td>
      <td>#1e2830</td>
      <td>Cancheros</td>
      <td>2025-04-26</td>
      <td>#1e2830</td>
      <td>27.0</td>
      <td>45</td>
      <td>584696</td>
      <td>2425903.0</td>
      <td>60000</td>
      <td>1992.0</td>
      <td>18.0</td>
      <td>1.500000</td>
    </tr>
    <tr>
      <th>4</th>
      <td>Chac Tu Chac</td>
      <td>#1e2830</td>
      <td>Los Mocosos</td>
      <td>2025-05-03</td>
      <td>#1e2830</td>
      <td>46.0</td>
      <td>49</td>
      <td>1962612</td>
      <td>4519761.0</td>
      <td>60000</td>
      <td>1992.0</td>
      <td>18.0</td>
      <td>2.555556</td>
    </tr>
    <tr>
      <th>...</th>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
    </tr>
    <tr>
      <th>155</th>
      <td>Ineditos</td>
      <td>#d57f5c</td>
      <td>Silver Moon</td>
      <td>2008-11-08</td>
      <td>#b3b3b3</td>
      <td>1.0</td>
      <td>37</td>
      <td>47018953</td>
      <td>NaN</td>
      <td>80000</td>
      <td>2008.0</td>
      <td>2.0</td>
      <td>0.500000</td>
    </tr>
    <tr>
      <th>156</th>
      <td>Ineditos</td>
      <td>#d57f5c</td>
      <td>Superstition</td>
      <td>2009-04-04</td>
      <td>#b3b3b3</td>
      <td>3.0</td>
      <td>77</td>
      <td>9150</td>
      <td>NaN</td>
      <td>80000</td>
      <td>2008.0</td>
      <td>2.0</td>
      <td>1.500000</td>
    </tr>
    <tr>
      <th>157</th>
      <td>Ineditos</td>
      <td>#d57f5c</td>
      <td>Sabado Noche</td>
      <td>2025-04-13</td>
      <td>#b3b3b3</td>
      <td>1.0</td>
      <td>41</td>
      <td>2435142</td>
      <td>NaN</td>
      <td>80000</td>
      <td>2025.0</td>
      <td>1.0</td>
      <td>1.000000</td>
    </tr>
    <tr>
      <th>158</th>
      <td>Ineditos</td>
      <td>#d57f5c</td>
      <td>Juana Azurduy</td>
      <td>2025-05-25</td>
      <td>#b3b3b3</td>
      <td>3.0</td>
      <td>29</td>
      <td>1916185</td>
      <td>NaN</td>
      <td>80000</td>
      <td>2025.0</td>
      <td>1.0</td>
      <td>3.000000</td>
    </tr>
    <tr>
      <th>159</th>
      <td>Ineditos</td>
      <td>#d57f5c</td>
      <td>Marcha De San Lorenzo</td>
      <td>2025-05-24</td>
      <td>#b3b3b3</td>
      <td>1.0</td>
      <td>30</td>
      <td>8065490</td>
      <td>NaN</td>
      <td>80000</td>
      <td>2025.0</td>
      <td>1.0</td>
      <td>1.000000</td>
    </tr>
  </tbody>
</table>
<p>160 rows × 13 columns</p>
</div>
```
:::
:::

::: {#c73d6dd7 .cell .code execution_count="161"}
``` python
df_canciones[["veces_tocada", "spotify_popularity", "reprod_youtube", "reproducciones_spotify", "ventas", 'veces_tocada_por_año']].corr()
```

::: {.output .execute_result execution_count="161"}
```{=html}
<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>veces_tocada</th>
      <th>spotify_popularity</th>
      <th>reprod_youtube</th>
      <th>reproducciones_spotify</th>
      <th>ventas</th>
      <th>veces_tocada_por_año</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>veces_tocada</th>
      <td>1.000000</td>
      <td>0.263441</td>
      <td>-0.029357</td>
      <td>0.505838</td>
      <td>0.336240</td>
      <td>0.707822</td>
    </tr>
    <tr>
      <th>spotify_popularity</th>
      <td>0.263441</td>
      <td>1.000000</td>
      <td>0.185920</td>
      <td>0.789214</td>
      <td>0.080713</td>
      <td>0.241483</td>
    </tr>
    <tr>
      <th>reprod_youtube</th>
      <td>-0.029357</td>
      <td>0.185920</td>
      <td>1.000000</td>
      <td>0.596966</td>
      <td>-0.031935</td>
      <td>-0.031935</td>
    </tr>
    <tr>
      <th>reproducciones_spotify</th>
      <td>0.505838</td>
      <td>0.789214</td>
      <td>0.596966</td>
      <td>1.000000</td>
      <td>0.114252</td>
      <td>0.404401</td>
    </tr>
    <tr>
      <th>ventas</th>
      <td>0.336240</td>
      <td>0.080713</td>
      <td>-0.031935</td>
      <td>0.114252</td>
      <td>1.000000</td>
      <td>0.143612</td>
    </tr>
    <tr>
      <th>veces_tocada_por_año</th>
      <td>0.707822</td>
      <td>0.241483</td>
      <td>-0.031935</td>
      <td>0.404401</td>
      <td>0.143612</td>
      <td>1.000000</td>
    </tr>
  </tbody>
</table>
</div>
```
:::
:::

::: {#410e4ee3 .cell .code execution_count="162"}
``` python
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
# Selecciona las columnas a usar en el índice
cols = [
    "veces_tocada_por_año",
    "spotify_popularity",
    "reprod_youtube",
    "reproducciones_spotify",
    "ventas"
]


# Z-score (media 0, std 1)
scaler_z = StandardScaler()
df_popularidad = df_canciones.copy()
df_popularidad[[f"{c}_z" for c in cols]] = scaler_z.fit_transform(df_canciones[cols].fillna(0))

# --- 4. Calculamos los Pesos---

# Usamos PCA para calcular los pesos de cada variable (en la escala z-score)
pca = PCA(n_components=len(cols))
X_z = df_popularidad[[f"{c}_z" for c in cols]].fillna(0)
pca.fit(X_z)

# Tomamos la varianza explicada por cada componente y el peso absoluto de cada variable en el primer componente
component_1 = np.abs(pca.components_[0])
pesos_pca = component_1 / component_1.sum()

# Asociamos cada peso a su columna z-score
pesos_dict = {f"{col}_z": peso for col, peso in zip(cols, pesos_pca)}
# Puedes definir dos diccionarios de pesos diferentes
pesos_dict_album = {f"{col}_z": peso for col, peso in zip(cols, pesos_pca)}
pesos_dict_ineditos = {
    'veces_tocada_por_año_z': 0.4,
    'spotify_popularity_z': 0.2,
    'reprod_youtube_z': 0.2,
    'reproducciones_spotify_z': 0.1,
    'ventas_z': 0.1
}
```
:::

::: {#ca2b4219 .cell .code execution_count="163"}
``` python
# --- 5. Mostramos ---
# Calcula el índice de popularidad usando pesos diferentes según el álbum
def calcular_indice_popularidad(row):
    if row['álbum'] == 'Ineditos':
        pesos = pesos_dict_ineditos
    else:
        pesos = pesos_dict
    return sum(row[col] * peso for col, peso in pesos.items())

df_popularidad['indice_popularidad'] = df_popularidad.apply(calcular_indice_popularidad, axis=1)
df_popularidad[['álbum', 'canción', 'indice_popularidad'] + [f"{c}_z" for c in cols]]

# Normaliza el índice de popularidad entre 0 y 1
min_val = df_popularidad['indice_popularidad'].min()
max_val = df_popularidad['indice_popularidad'].max()
df_popularidad['indice_popularidad_norm'] = (df_popularidad['indice_popularidad'] - min_val) / (max_val - min_val)



df_popularidad.sort_values(by='indice_popularidad_norm', ascending=False).head()
```

::: {.output .execute_result execution_count="163"}
```{=html}
<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>álbum</th>
      <th>color_álbum</th>
      <th>canción</th>
      <th>fecha</th>
      <th>color</th>
      <th>veces_tocada</th>
      <th>spotify_popularity</th>
      <th>reprod_youtube</th>
      <th>reproducciones_spotify</th>
      <th>ventas</th>
      <th>año_lanzamiento</th>
      <th>años_vigencia</th>
      <th>veces_tocada_por_año</th>
      <th>veces_tocada_por_año_z</th>
      <th>spotify_popularity_z</th>
      <th>reprod_youtube_z</th>
      <th>reproducciones_spotify_z</th>
      <th>ventas_z</th>
      <th>indice_popularidad</th>
      <th>indice_popularidad_norm</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>2</th>
      <td>Chac Tu Chac</td>
      <td>#1e2830</td>
      <td>Tan Solo</td>
      <td>2025-05-25</td>
      <td>#1e2830</td>
      <td>126.0</td>
      <td>69</td>
      <td>15922263</td>
      <td>105944732.0</td>
      <td>60000</td>
      <td>1992.0</td>
      <td>18.0</td>
      <td>7.000000</td>
      <td>1.180062</td>
      <td>1.622176</td>
      <td>0.551958</td>
      <td>7.491324</td>
      <td>-0.610634</td>
      <td>2.876289</td>
      <td>1.000000</td>
    </tr>
    <tr>
      <th>83</th>
      <td>Civilizacion</td>
      <td>#d7c391</td>
      <td>Bicho De Ciudad</td>
      <td>2025-05-25</td>
      <td>#d7c391</td>
      <td>52.0</td>
      <td>69</td>
      <td>4262418</td>
      <td>64948157.0</td>
      <td>80000</td>
      <td>2007.0</td>
      <td>3.0</td>
      <td>17.333333</td>
      <td>4.046997</td>
      <td>1.622176</td>
      <td>-0.104704</td>
      <td>4.431157</td>
      <td>-0.352165</td>
      <td>2.710580</td>
      <td>0.957570</td>
    </tr>
    <tr>
      <th>26</th>
      <td>3er Arco</td>
      <td>#ead936</td>
      <td>El Farolito</td>
      <td>2025-05-25</td>
      <td>#ead936</td>
      <td>120.0</td>
      <td>68</td>
      <td>20467350</td>
      <td>64780986.0</td>
      <td>360000</td>
      <td>1996.0</td>
      <td>14.0</td>
      <td>8.571429</td>
      <td>1.616048</td>
      <td>1.547010</td>
      <td>0.807929</td>
      <td>4.418678</td>
      <td>3.266410</td>
      <td>2.600115</td>
      <td>0.929285</td>
    </tr>
    <tr>
      <th>60</th>
      <td>Verde Paisaje del Infierno</td>
      <td>#648e5c</td>
      <td>Ruleta</td>
      <td>2025-05-25</td>
      <td>#648e5c</td>
      <td>88.0</td>
      <td>66</td>
      <td>7532476</td>
      <td>46247255.0</td>
      <td>120000</td>
      <td>2000.0</td>
      <td>10.0</td>
      <td>8.800000</td>
      <td>1.679464</td>
      <td>1.396678</td>
      <td>0.079460</td>
      <td>3.035238</td>
      <td>0.164774</td>
      <td>1.701312</td>
      <td>0.699145</td>
    </tr>
    <tr>
      <th>81</th>
      <td>Civilizacion</td>
      <td>#d7c391</td>
      <td>Pacifico</td>
      <td>2025-05-24</td>
      <td>#d7c391</td>
      <td>54.0</td>
      <td>60</td>
      <td>11795870</td>
      <td>20280986.0</td>
      <td>80000</td>
      <td>2007.0</td>
      <td>3.0</td>
      <td>18.000000</td>
      <td>4.231961</td>
      <td>0.945682</td>
      <td>0.319567</td>
      <td>1.097000</td>
      <td>-0.352165</td>
      <td>1.637807</td>
      <td>0.682885</td>
    </tr>
  </tbody>
</table>
</div>
```
:::
:::

::: {#15d7b40d .cell .code execution_count="164"}
``` python
df_popularidad.to_excel('canciones_popularidad.xlsx', index=False, header=True)
```
:::

::: {#b68f257c .cell .markdown}

------------------------------------------------------------------------
:::

::: {#e6a521bd .cell .code execution_count="165"}
``` python
# Función para normalizar nombres de canciones (quita espacios extra y pasa a minúsculas)
def normalize(song):
    song = song.strip().lower()
    song = ''.join(c for c in unicodedata.normalize('NFKD', song) if not unicodedata.combining(c) or c == 'ñ')
    return song



with open('setlists_vuelta.json', 'r', encoding='utf-8') as f:
    setlists_data = json.load(f)




# Ordenar los setlists por fecha (usando year, month, day)
setlists_data.sort(key=lambda s: date(s["year"], s["month"], s["day"]))

# Procesar cada setlist y contar acumulativamente
records = []
cumulative_counts = {}

for setlist in setlists_data:
    # Crear fecha en formato ISO
    current_date = date(setlist["year"], setlist["month"], setlist["day"]).isoformat()
    
    # Procesar la lista de canciones, separando por "/" si es necesario
    canciones_raw = setlist.get("songs", [])
    canciones = []
    for item in canciones_raw:
        for part in item.split('/'):
            if part.strip():
                canciones.append(part.strip())
    
    # Actualizar los conteos acumulados
    for song in canciones:
        norm_song = normalize(song)
        cumulative_counts[norm_song] = cumulative_counts.get(norm_song, 0) + 1
    # Registrar el estado acumulado hasta la fecha actual
    for song, count in cumulative_counts.items():
        album = song_to_album.get(song, "Ineditos")
        color = song_to_color.get(song, "#000000")
        records.append({
            "fecha": current_date,
            "canción": song.title(),  # Capitalizamos para visualización
            "álbum": album,
            "color": color,
            "veces_tocada": count,

        })

# Crear DataFrame y agrupar para quedarnos con el último conteo de cada fecha
df_vuelta_total = pd.DataFrame(records)


df_vuelta_total[df_vuelta_total['fecha'] == '2025-05-25'].head()
```

::: {.output .execute_result execution_count="165"}
```{=html}
<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>fecha</th>
      <th>canción</th>
      <th>álbum</th>
      <th>color</th>
      <th>veces_tocada</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>795</th>
      <td>2025-05-25</td>
      <td>Te Diria</td>
      <td>Ay Ay Ay</td>
      <td>#c41616</td>
      <td>8</td>
    </tr>
    <tr>
      <th>796</th>
      <td>2025-05-25</td>
      <td>Desde Lejos No Se Ve</td>
      <td>Azul</td>
      <td>#0047a5</td>
      <td>8</td>
    </tr>
    <tr>
      <th>797</th>
      <td>2025-05-25</td>
      <td>Babilonia</td>
      <td>Ay Ay Ay</td>
      <td>#c41616</td>
      <td>5</td>
    </tr>
    <tr>
      <th>798</th>
      <td>2025-05-25</td>
      <td>Ay Ay Ay</td>
      <td>Ay Ay Ay</td>
      <td>#c41616</td>
      <td>14</td>
    </tr>
    <tr>
      <th>799</th>
      <td>2025-05-25</td>
      <td>Todo Pasa</td>
      <td>3er Arco</td>
      <td>#ead936</td>
      <td>3</td>
    </tr>
  </tbody>
</table>
</div>
```
:::
:::

::: {#22312c03 .cell .code execution_count="166"}
``` python
import json
from datetime import date

# Asume que song_to_album y song_to_color ya están definidos

with open('setlists_vuelta.json', 'r', encoding='utf-8') as f:
    setlists_data = json.load(f)

all_records = []

for setlist in setlists_data:
    current_date = date(setlist["year"], setlist["month"], setlist["day"]).isoformat()
    canciones_raw = setlist.get("songs", [])
    canciones = []
    for item in canciones_raw:
        for part in item.split('/'):
            if part.strip():
                canciones.append(part.strip())
    for song in canciones:
        norm_song = normalize(song)
        album = song_to_album.get(norm_song, "Ineditos")
        color = song_to_color.get(norm_song, "#000000")
        all_records.append({
            "fecha": current_date,
            "canción": song.title(),
            "álbum": album,
            "color": color  # Solo cuenta 1 para este concierto
        })

# Super DataFrame con todas las fechas y canciones (sin acumulativo)
df_super = pd.DataFrame(all_records)
df_super


```

::: {.output .execute_result execution_count="166"}
```{=html}
<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>fecha</th>
      <th>canción</th>
      <th>álbum</th>
      <th>color</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>2025-05-25</td>
      <td>Unbekannt</td>
      <td>Civilizacion</td>
      <td>#d7c391</td>
    </tr>
    <tr>
      <th>1</th>
      <td>2025-05-25</td>
      <td>Desde Lejos No Se Ve</td>
      <td>Azul</td>
      <td>#0047a5</td>
    </tr>
    <tr>
      <th>2</th>
      <td>2025-05-25</td>
      <td>Ruleta</td>
      <td>Verde Paisaje del Infierno</td>
      <td>#648e5c</td>
    </tr>
    <tr>
      <th>3</th>
      <td>2025-05-25</td>
      <td>Difícil</td>
      <td>Civilizacion</td>
      <td>#d7c391</td>
    </tr>
    <tr>
      <th>4</th>
      <td>2025-05-25</td>
      <td>Media Caña</td>
      <td>Verde Paisaje del Infierno</td>
      <td>#648e5c</td>
    </tr>
    <tr>
      <th>...</th>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
    </tr>
    <tr>
      <th>416</th>
      <td>2024-12-14</td>
      <td>Muévelo</td>
      <td>3er Arco</td>
      <td>#ead936</td>
    </tr>
    <tr>
      <th>417</th>
      <td>2024-12-14</td>
      <td>El Farolito</td>
      <td>3er Arco</td>
      <td>#ead936</td>
    </tr>
    <tr>
      <th>418</th>
      <td>2024-12-14</td>
      <td>Finale</td>
      <td>Azul</td>
      <td>#0047a5</td>
    </tr>
    <tr>
      <th>419</th>
      <td>2024-12-14</td>
      <td>Cruel</td>
      <td>Chac Tu Chac</td>
      <td>#1e2830</td>
    </tr>
    <tr>
      <th>420</th>
      <td>2024-12-14</td>
      <td>Himno Nacional Argentino</td>
      <td>Ineditos</td>
      <td>#d57f5c</td>
    </tr>
  </tbody>
</table>
<p>421 rows × 4 columns</p>
</div>
```
:::
:::

::: {#b1f7a3af .cell .code execution_count="167"}
``` python
# 1. Normaliza los nombres de las canciones en ambos DataFrames para hacer el merge
df_super['cancion_norm'] = df_super['canción'].apply(normalize)
df_popularidad['cancion_norm'] = df_popularidad['canción'].apply(normalize)

# 2. Une la popularidad a cada canción tocada en cada concierto
df_super = df_super.merge(
    df_popularidad[['cancion_norm', 'indice_popularidad']],
    on='cancion_norm',
    how='left'
)
```
:::

::: {#376f85dd .cell .code execution_count="168"}
``` python
# 3. Calcula el promedio de popularidad por concierto (por fecha)
df_conciertos_pop = df_super.groupby('fecha')['indice_popularidad'].mean().reset_index()
df_conciertos_pop = df_conciertos_pop.sort_values('indice_popularidad', ascending=False)


# 4. Ahora puedes ver los conciertos más "mainstream" y más "alternativos"
print("Recitales ordenados de mayor a menor popularidad en promedio:")
print(df_conciertos_pop.sort_values('indice_popularidad', ascending=False))
```

::: {.output .stream .stdout}
    Recitales ordenados de mayor a menor popularidad en promedio:
             fecha  indice_popularidad
    7   2025-02-16            0.832397
    0   2024-12-14            0.790725
    10  2025-05-03            0.761230
    8   2025-04-13            0.757790
    11  2025-05-10            0.751087
    9   2025-04-26            0.705820
    1   2024-12-15            0.666556
    3   2024-12-21            0.653611
    5   2025-01-25            0.610675
    2   2024-12-18            0.585763
    6   2025-01-26            0.564043
    4   2024-12-22            0.562661
    13  2025-05-25            0.474778
    12  2025-05-24            0.332260
:::
:::

::: {#f26f636d .cell .code execution_count="169"}
``` python
df_conciertos_pop
```

::: {.output .execute_result execution_count="169"}
```{=html}
<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>fecha</th>
      <th>indice_popularidad</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>7</th>
      <td>2025-02-16</td>
      <td>0.832397</td>
    </tr>
    <tr>
      <th>0</th>
      <td>2024-12-14</td>
      <td>0.790725</td>
    </tr>
    <tr>
      <th>10</th>
      <td>2025-05-03</td>
      <td>0.761230</td>
    </tr>
    <tr>
      <th>8</th>
      <td>2025-04-13</td>
      <td>0.757790</td>
    </tr>
    <tr>
      <th>11</th>
      <td>2025-05-10</td>
      <td>0.751087</td>
    </tr>
    <tr>
      <th>9</th>
      <td>2025-04-26</td>
      <td>0.705820</td>
    </tr>
    <tr>
      <th>1</th>
      <td>2024-12-15</td>
      <td>0.666556</td>
    </tr>
    <tr>
      <th>3</th>
      <td>2024-12-21</td>
      <td>0.653611</td>
    </tr>
    <tr>
      <th>5</th>
      <td>2025-01-25</td>
      <td>0.610675</td>
    </tr>
    <tr>
      <th>2</th>
      <td>2024-12-18</td>
      <td>0.585763</td>
    </tr>
    <tr>
      <th>6</th>
      <td>2025-01-26</td>
      <td>0.564043</td>
    </tr>
    <tr>
      <th>4</th>
      <td>2024-12-22</td>
      <td>0.562661</td>
    </tr>
    <tr>
      <th>13</th>
      <td>2025-05-25</td>
      <td>0.474778</td>
    </tr>
    <tr>
      <th>12</th>
      <td>2025-05-24</td>
      <td>0.332260</td>
    </tr>
  </tbody>
</table>
</div>
```
:::
:::

::: {#9dcf5b3a .cell .code execution_count="170"}
``` python
df_conciertos_pop.to_excel('recitales_ordenados_por_popularidad.xlsx',index = False, header=True)
```
:::
