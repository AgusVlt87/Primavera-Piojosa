::: {#726a2c83 .cell .code execution_count="1"}
``` python
import pandas as pd
import unicodedata
import json
import json
from datetime import date
```
:::

::: {#2ba1f08a .cell .code execution_count="2"}
``` python
# Función para normalizar nombres de canciones (quita espacios extra y pasa a minúsculas)
def normalize(song):
    song = song.strip().lower()
    song = ''.join(c for c in unicodedata.normalize('NFKD', song) if not unicodedata.combining(c) or c == 'ñ')
    return song
```
:::

::: {#1c5890b7 .cell .code execution_count="3"}
``` python
# Cargar los archivos JSON
with open(r'C:\Users\Yo\Desktop\setlist\SetlistFM-Setlist-Evolution\album_data\Los Piojos.json', 'r', encoding='utf-8') as f:
    albums_data = json.load(f)


with open('Setlists_Piojos.json', 'r', encoding='utf-8') as f:
    setlists_data = json.load(f)
```
:::

::: {#fc01efa9 .cell .code execution_count="4"}
``` python

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
```
:::

:::: {#ad9cf94d .cell .code execution_count="5"}
``` python

df_popularidad = pd.read_excel(r'C:\Users\Yo\Desktop\setlist\SetlistFM-Setlist-Evolution\canciones_popularidad.xlsx')


# Ordenar los setlists por fecha (usando year, month, day)
setlists_data.sort(key=lambda s: date(s["year"], s["month"], s["day"]))

# Procesar cada setlist y contar acumulativamente
records = []
cumulative_counts = {}

for setlist in setlists_data:
    # Crear fecha en formato ISO
    current_date = date(setlist["year"], setlist["month"], setlist["day"]).isoformat()
    place = setlist["venue"]
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
            "lugar": place,
            "canción": song.title(),  # Capitalizamos para visualización
            "álbum": album,
            "color": color,
            "veces_tocada": count
        })

# Crear DataFrame y agrupar para quedarnos con el último conteo de cada fecha
df_vuelta_total = pd.DataFrame(records)


df_vuelta_total[df_vuelta_total['fecha'] == '2025-05-25'].head()

# Asume que song_to_album y song_to_color ya están definidos


all_records = []

for setlist in setlists_data:
    current_date = date(setlist["year"], setlist["month"], setlist["day"]).isoformat()
    place = setlist["venue"]
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
            "lugar": place,
            "canción": song.title(),
            "álbum": album,
            "color": color  # Solo cuenta 1 para este concierto
        })

# Super DataFrame con todas las fechas y canciones (sin acumulativo)
df_super = pd.DataFrame(all_records)

df_super
```

::: {.output .execute_result execution_count="5"}
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
      <th>lugar</th>
      <th>canción</th>
      <th>álbum</th>
      <th>color</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>1991-09-21</td>
      <td>Boa Vista, Buenos Aires, Argentina</td>
      <td>Blues Del Gato Sarnoso</td>
      <td>Ineditos</td>
      <td>#d57f5c</td>
    </tr>
    <tr>
      <th>1</th>
      <td>1991-09-21</td>
      <td>Boa Vista, Buenos Aires, Argentina</td>
      <td>Los Mocosos</td>
      <td>Chac Tu Chac</td>
      <td>#1e2830</td>
    </tr>
    <tr>
      <th>2</th>
      <td>1991-09-21</td>
      <td>Boa Vista, Buenos Aires, Argentina</td>
      <td>Blues Del Traje Gris</td>
      <td>Chac Tu Chac</td>
      <td>#1e2830</td>
    </tr>
    <tr>
      <th>3</th>
      <td>1991-09-21</td>
      <td>Boa Vista, Buenos Aires, Argentina</td>
      <td>Chac Tu Chac</td>
      <td>Chac Tu Chac</td>
      <td>#1e2830</td>
    </tr>
    <tr>
      <th>4</th>
      <td>1991-09-21</td>
      <td>Boa Vista, Buenos Aires, Argentina</td>
      <td>Babilonia</td>
      <td>Ay Ay Ay</td>
      <td>#c41616</td>
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
      <th>4100</th>
      <td>2025-05-25</td>
      <td>Parque de la Ciudad, Buenos Aires, Argentina</td>
      <td>El Farolito</td>
      <td>3er Arco</td>
      <td>#ead936</td>
    </tr>
    <tr>
      <th>4101</th>
      <td>2025-05-25</td>
      <td>Parque de la Ciudad, Buenos Aires, Argentina</td>
      <td>El Balneario De Los Doctores Crotos</td>
      <td>Azul</td>
      <td>#0047a5</td>
    </tr>
    <tr>
      <th>4102</th>
      <td>2025-05-25</td>
      <td>Parque de la Ciudad, Buenos Aires, Argentina</td>
      <td>Cruel</td>
      <td>Chac Tu Chac</td>
      <td>#1e2830</td>
    </tr>
    <tr>
      <th>4103</th>
      <td>2025-05-25</td>
      <td>Parque de la Ciudad, Buenos Aires, Argentina</td>
      <td>Finale</td>
      <td>Azul</td>
      <td>#0047a5</td>
    </tr>
    <tr>
      <th>4104</th>
      <td>2025-05-25</td>
      <td>Parque de la Ciudad, Buenos Aires, Argentina</td>
      <td>Himno Nacional Argentino</td>
      <td>Ineditos</td>
      <td>#d57f5c</td>
    </tr>
  </tbody>
</table>
<p>4105 rows × 5 columns</p>
</div>
:::
::::

::: {#ad25e56d .cell .code execution_count="6"}
``` python
df_super['cancion_norm'] = df_super['canción'].apply(normalize)
df_popularidad['cancion_norm'] = df_popularidad['canción'].apply(normalize)
```
:::

:::: {#ea8e6c34 .cell .code execution_count="7"}
``` python

# 2. Une la popularidad a cada canción tocada en cada concierto
df_super = df_super.merge(
    df_popularidad[['cancion_norm', 'indice_popularidad', 'indice_popularidad_norm']],
    on='cancion_norm',
    how='left'
)

df_super
```

::: {.output .execute_result execution_count="7"}
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
      <th>lugar</th>
      <th>canción</th>
      <th>álbum</th>
      <th>color</th>
      <th>cancion_norm</th>
      <th>indice_popularidad</th>
      <th>indice_popularidad_norm</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>1991-09-21</td>
      <td>Boa Vista, Buenos Aires, Argentina</td>
      <td>Blues Del Gato Sarnoso</td>
      <td>Ineditos</td>
      <td>#d57f5c</td>
      <td>blues del gato sarnoso</td>
      <td>-0.787491</td>
      <td>0.061883</td>
    </tr>
    <tr>
      <th>1</th>
      <td>1991-09-21</td>
      <td>Boa Vista, Buenos Aires, Argentina</td>
      <td>Los Mocosos</td>
      <td>Chac Tu Chac</td>
      <td>#1e2830</td>
      <td>los mocosos</td>
      <td>-0.108193</td>
      <td>0.235819</td>
    </tr>
    <tr>
      <th>2</th>
      <td>1991-09-21</td>
      <td>Boa Vista, Buenos Aires, Argentina</td>
      <td>Blues Del Traje Gris</td>
      <td>Chac Tu Chac</td>
      <td>#1e2830</td>
      <td>blues del traje gris</td>
      <td>-0.489090</td>
      <td>0.138290</td>
    </tr>
    <tr>
      <th>3</th>
      <td>1991-09-21</td>
      <td>Boa Vista, Buenos Aires, Argentina</td>
      <td>Chac Tu Chac</td>
      <td>Chac Tu Chac</td>
      <td>#1e2830</td>
      <td>chac tu chac</td>
      <td>0.019795</td>
      <td>0.268590</td>
    </tr>
    <tr>
      <th>4</th>
      <td>1991-09-21</td>
      <td>Boa Vista, Buenos Aires, Argentina</td>
      <td>Babilonia</td>
      <td>Ay Ay Ay</td>
      <td>#c41616</td>
      <td>babilonia</td>
      <td>0.204522</td>
      <td>0.315890</td>
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
      <th>4100</th>
      <td>2025-05-25</td>
      <td>Parque de la Ciudad, Buenos Aires, Argentina</td>
      <td>El Farolito</td>
      <td>3er Arco</td>
      <td>#ead936</td>
      <td>el farolito</td>
      <td>2.600115</td>
      <td>0.929285</td>
    </tr>
    <tr>
      <th>4101</th>
      <td>2025-05-25</td>
      <td>Parque de la Ciudad, Buenos Aires, Argentina</td>
      <td>El Balneario De Los Doctores Crotos</td>
      <td>Azul</td>
      <td>#0047a5</td>
      <td>el balneario de los doctores crotos</td>
      <td>0.658090</td>
      <td>0.432027</td>
    </tr>
    <tr>
      <th>4102</th>
      <td>2025-05-25</td>
      <td>Parque de la Ciudad, Buenos Aires, Argentina</td>
      <td>Cruel</td>
      <td>Chac Tu Chac</td>
      <td>#1e2830</td>
      <td>cruel</td>
      <td>0.159382</td>
      <td>0.304332</td>
    </tr>
    <tr>
      <th>4103</th>
      <td>2025-05-25</td>
      <td>Parque de la Ciudad, Buenos Aires, Argentina</td>
      <td>Finale</td>
      <td>Azul</td>
      <td>#0047a5</td>
      <td>finale</td>
      <td>0.146156</td>
      <td>0.300945</td>
    </tr>
    <tr>
      <th>4104</th>
      <td>2025-05-25</td>
      <td>Parque de la Ciudad, Buenos Aires, Argentina</td>
      <td>Himno Nacional Argentino</td>
      <td>Ineditos</td>
      <td>#d57f5c</td>
      <td>himno nacional argentino</td>
      <td>-0.328465</td>
      <td>0.179418</td>
    </tr>
  </tbody>
</table>
<p>4105 rows × 8 columns</p>
</div>
:::
::::

:::: {#4b0704ed .cell .code execution_count="8"}
``` python
# 3. Calcula el promedio de popularidad por concierto (por fecha)
df_conciertos = df_super.groupby('fecha')['indice_popularidad_norm'].mean().reset_index()
df_conciertos = df_conciertos.sort_values('indice_popularidad_norm', ascending=False)


# 4. Ahora puedes ver los conciertos más "mainstream" y más "alternativos"
print("Recitales ordenados de mayor a menor popularidad en promedio:")
print(df_conciertos.sort_values('indice_popularidad_norm', ascending=False))
```

::: {.output .stream .stdout}
    Recitales ordenados de mayor a menor popularidad en promedio:
              fecha  indice_popularidad_norm
    138  2008-05-01                 0.885572
    91   2004-10-10                 0.793305
    160  2009-03-26                 0.655949
    113  2007-05-06                 0.596631
    145  2008-06-14                 0.573115
    ..          ...                      ...
    5    1994-08-06                 0.284987
    3    1993-07-09                 0.229025
    2    1992-11-14                 0.224915
    1    1991-11-09                 0.213641
    0    1991-09-21                 0.195510

    [178 rows x 2 columns]
:::
::::

:::: {#ef4f2f25 .cell .code execution_count="9"}
``` python
# Filtrar fechas donde se hayan tocado más de 10 temas
fechas_mas_10 = df_super['fecha'].value_counts()
fechas_validas = fechas_mas_10[fechas_mas_10 > 15].index
df_super = df_super[df_super['fecha'].isin(fechas_validas)]
velez = df_super[df_super['fecha'] == '2004-05-22']
velez['indice_popularidad_norm'].median()
```

::: {.output .execute_result execution_count="9"}
    0.3058366526768369
:::
::::

:::: {#5df28001 .cell .code execution_count="10"}
``` python

# 3. Calcula el promedio de popularidad por concierto (por fecha)
df_conciertos = df_super.groupby(['fecha', 'lugar'])['indice_popularidad_norm'].mean().reset_index()
df_conciertos = df_conciertos.sort_values('indice_popularidad_norm', ascending=False)
df_conciertos = df_conciertos[df_conciertos['fecha'] > '2000-06-10']
df_conciertos = df_conciertos.sort_values(by= 'indice_popularidad_norm', ascending= False)
# 4. Ahora puedes ver los conciertos más "mainstream" y más "alternativos"
print("Recitales ordenados de mayor a menor popularidad en promedio:")
print(df_conciertos)
```

::: {.output .stream .stdout}
    Recitales ordenados de mayor a menor popularidad en promedio:
              fecha                                              lugar  \
    108  2007-11-17  Estadio Abierto del Parque de Mayo, San Juan, ...   
    131  2008-11-15  Anfiteatro Mario del Tránsito Cocomarola, Corr...   
    120  2008-05-02              Sala Assaig, Palma de Mallorca, Spain   
    133  2008-11-22  Monumento al Obrero Petrolero, Caleta Olivia, ...   
    112  2007-12-11               Estadio Ruca Che, Neuquén, Argentina   
    ..          ...                                                ...   
    88   2006-04-26         Estadio Luna Park, Buenos Aires, Argentina   
    34   2000-07-16  Estadio Obras Sanitarias, Buenos Aires, Argentina   
    83   2005-10-01                 Estadio Unión, Santa Fe, Argentina   
    85   2005-12-22      Estadio Boca Juniors, Buenos Aires, Argentina   
    72   2004-05-22   Estadio Vélez Sarsfield, Buenos Aires, Argentina   

         indice_popularidad_norm  
    108                 0.562223  
    131                 0.558008  
    120                 0.550606  
    133                 0.547218  
    112                 0.539150  
    ..                       ...  
    88                  0.329469  
    34                  0.327725  
    83                  0.322628  
    85                  0.316421  
    72                  0.313943  

    [126 rows x 3 columns]
:::
::::

::: {#60b1a5cb .cell .code execution_count="11"}
``` python
df_conciertos.to_excel('recitales_ordenados_por_popularidad.xlsx', index = False)
```
:::

:::: {#18ec5e3d .cell .code execution_count="12"}
``` python
# Filtrar df_super para excluir canciones del álbum "Ineditos"
df_super_sin_ineditos = df_super[df_super['álbum'] != 'Ineditos']

# Calcular el promedio de popularidad por concierto (fecha y lugar) sin inéditos
df_conciertos_sin_ineditos = df_super_sin_ineditos.groupby(['fecha', 'lugar'])['indice_popularidad_norm'].mean().reset_index()
df_conciertos_sin_ineditos = df_conciertos_sin_ineditos[df_conciertos_sin_ineditos['fecha'] > '1997-02-10']
df_conciertos_sin_ineditos.sort_values(by= 'indice_popularidad_norm', ascending= False).tail(27)
```

::: {.output .execute_result execution_count="12"}
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
      <th>lugar</th>
      <th>indice_popularidad_norm</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>70</th>
      <td>2004-01-30</td>
      <td>Patinódromo Municipal, Mar del Plata, Argentina</td>
      <td>0.373043</td>
    </tr>
    <tr>
      <th>27</th>
      <td>1999-12-18</td>
      <td>Estadio Atlanta, Buenos Aires, Argentina</td>
      <td>0.372201</td>
    </tr>
    <tr>
      <th>93</th>
      <td>2006-08-25</td>
      <td>Estadio Luna Park, Buenos Aires, Argentina</td>
      <td>0.371743</td>
    </tr>
    <tr>
      <th>26</th>
      <td>1999-10-09</td>
      <td>Estadio All Boys, Buenos Aires, Argentina</td>
      <td>0.370620</td>
    </tr>
    <tr>
      <th>154</th>
      <td>2025-05-24</td>
      <td>Parque de la Ciudad, Buenos Aires, Argentina</td>
      <td>0.369988</td>
    </tr>
    <tr>
      <th>86</th>
      <td>2005-12-23</td>
      <td>Estadio Boca Juniors, Buenos Aires, Argentina</td>
      <td>0.369546</td>
    </tr>
    <tr>
      <th>90</th>
      <td>2006-04-29</td>
      <td>Estadio Luna Park, Buenos Aires, Argentina</td>
      <td>0.369146</td>
    </tr>
    <tr>
      <th>92</th>
      <td>2006-08-24</td>
      <td>Estadio Luna Park, Buenos Aires, Argentina</td>
      <td>0.368913</td>
    </tr>
    <tr>
      <th>24</th>
      <td>1999-05-09</td>
      <td>Estadio Obras Sanitarias, Buenos Aires, Argentina</td>
      <td>0.368571</td>
    </tr>
    <tr>
      <th>22</th>
      <td>1999-05-07</td>
      <td>Estadio Obras Sanitarias, Buenos Aires, Argentina</td>
      <td>0.367862</td>
    </tr>
    <tr>
      <th>17</th>
      <td>1997-07-19</td>
      <td>Microestadio Racing Club, Avellaneda, Argentina</td>
      <td>0.367850</td>
    </tr>
    <tr>
      <th>23</th>
      <td>1999-05-08</td>
      <td>Estadio Obras Sanitarias, Buenos Aires, Argentina</td>
      <td>0.362630</td>
    </tr>
    <tr>
      <th>21</th>
      <td>1999-01-23</td>
      <td>Autocine Villa Gesell, Villa Gesell, Argentina</td>
      <td>0.361975</td>
    </tr>
    <tr>
      <th>33</th>
      <td>2000-07-15</td>
      <td>Estadio Obras Sanitarias, Buenos Aires, Argentina</td>
      <td>0.359820</td>
    </tr>
    <tr>
      <th>63</th>
      <td>2003-05-14</td>
      <td>Estadio Luna Park, Buenos Aires, Argentina</td>
      <td>0.359331</td>
    </tr>
    <tr>
      <th>61</th>
      <td>2003-01-24</td>
      <td>Patinódromo Municipal, Mar del Plata, Argentina</td>
      <td>0.358699</td>
    </tr>
    <tr>
      <th>16</th>
      <td>1997-07-18</td>
      <td>Microestadio Racing Club, Avellaneda, Argentina</td>
      <td>0.358387</td>
    </tr>
    <tr>
      <th>18</th>
      <td>1998-05-17</td>
      <td>Parque Sarmiento, Buenos Aires, Argentina</td>
      <td>0.354167</td>
    </tr>
    <tr>
      <th>37</th>
      <td>2001-01-13</td>
      <td>Autocine Villa Gesell, Villa Gesell, Argentina</td>
      <td>0.354079</td>
    </tr>
    <tr>
      <th>31</th>
      <td>2000-07-07</td>
      <td>Estadio Obras Sanitarias, Buenos Aires, Argentina</td>
      <td>0.351288</td>
    </tr>
    <tr>
      <th>88</th>
      <td>2006-04-26</td>
      <td>Estadio Luna Park, Buenos Aires, Argentina</td>
      <td>0.349983</td>
    </tr>
    <tr>
      <th>84</th>
      <td>2005-10-07</td>
      <td>Obras Sanitarias Outdoor, Buenos Aires, Argentina</td>
      <td>0.349472</td>
    </tr>
    <tr>
      <th>34</th>
      <td>2000-07-16</td>
      <td>Estadio Obras Sanitarias, Buenos Aires, Argentina</td>
      <td>0.343886</td>
    </tr>
    <tr>
      <th>19</th>
      <td>1998-08-22</td>
      <td>Polideportivo Club de Gimnasia y Esgrima La Pl...</td>
      <td>0.336848</td>
    </tr>
    <tr>
      <th>85</th>
      <td>2005-12-22</td>
      <td>Estadio Boca Juniors, Buenos Aires, Argentina</td>
      <td>0.332697</td>
    </tr>
    <tr>
      <th>72</th>
      <td>2004-05-22</td>
      <td>Estadio Vélez Sarsfield, Buenos Aires, Argentina</td>
      <td>0.327521</td>
    </tr>
    <tr>
      <th>83</th>
      <td>2005-10-01</td>
      <td>Estadio Unión, Santa Fe, Argentina</td>
      <td>0.322628</td>
    </tr>
  </tbody>
</table>
</div>
:::
::::

::: {#0d5ea894 .cell .code execution_count="13"}
``` python
df_conciertos_sin_ineditos[['Lugar', 'Localidad', 'País']] = df_conciertos_sin_ineditos['lugar'].str.split(',', expand=True)

df_conciertos_sin_ineditos[['Año', 'Mes', 'Día']] = df_conciertos_sin_ineditos['fecha'].str.split('-', expand=True)
```
:::

:::: {#583df6fe .cell .code execution_count="14"}
``` python
df_conciertos_sin_ineditos
```

::: {.output .execute_result execution_count="14"}
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
      <th>lugar</th>
      <th>indice_popularidad_norm</th>
      <th>Lugar</th>
      <th>Localidad</th>
      <th>País</th>
      <th>Año</th>
      <th>Mes</th>
      <th>Día</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>15</th>
      <td>1997-03-29</td>
      <td>Costa Chaval, Concordia, Argentina</td>
      <td>0.378780</td>
      <td>Costa Chaval</td>
      <td>Concordia</td>
      <td>Argentina</td>
      <td>1997</td>
      <td>03</td>
      <td>29</td>
    </tr>
    <tr>
      <th>16</th>
      <td>1997-07-18</td>
      <td>Microestadio Racing Club, Avellaneda, Argentina</td>
      <td>0.358387</td>
      <td>Microestadio Racing Club</td>
      <td>Avellaneda</td>
      <td>Argentina</td>
      <td>1997</td>
      <td>07</td>
      <td>18</td>
    </tr>
    <tr>
      <th>17</th>
      <td>1997-07-19</td>
      <td>Microestadio Racing Club, Avellaneda, Argentina</td>
      <td>0.367850</td>
      <td>Microestadio Racing Club</td>
      <td>Avellaneda</td>
      <td>Argentina</td>
      <td>1997</td>
      <td>07</td>
      <td>19</td>
    </tr>
    <tr>
      <th>18</th>
      <td>1998-05-17</td>
      <td>Parque Sarmiento, Buenos Aires, Argentina</td>
      <td>0.354167</td>
      <td>Parque Sarmiento</td>
      <td>Buenos Aires</td>
      <td>Argentina</td>
      <td>1998</td>
      <td>05</td>
      <td>17</td>
    </tr>
    <tr>
      <th>19</th>
      <td>1998-08-22</td>
      <td>Polideportivo Club de Gimnasia y Esgrima La Pl...</td>
      <td>0.336848</td>
      <td>Polideportivo Club de Gimnasia y Esgrima La Plata</td>
      <td>La Plata</td>
      <td>Argentina</td>
      <td>1998</td>
      <td>08</td>
      <td>22</td>
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
    </tr>
    <tr>
      <th>151</th>
      <td>2025-04-26</td>
      <td>Hipódromo Parque de La Independencia, Rosario,...</td>
      <td>0.466426</td>
      <td>Hipódromo Parque de La Independencia</td>
      <td>Rosario</td>
      <td>Argentina</td>
      <td>2025</td>
      <td>04</td>
      <td>26</td>
    </tr>
    <tr>
      <th>152</th>
      <td>2025-05-03</td>
      <td>Teatro Griego Frank Romero Day, Mendoza, Argen...</td>
      <td>0.474947</td>
      <td>Teatro Griego Frank Romero Day</td>
      <td>Mendoza</td>
      <td>Argentina</td>
      <td>2025</td>
      <td>05</td>
      <td>03</td>
    </tr>
    <tr>
      <th>153</th>
      <td>2025-05-10</td>
      <td>Playón Mario Alberto Kempes, Córdoba, Argentina</td>
      <td>0.486439</td>
      <td>Playón Mario Alberto Kempes</td>
      <td>Córdoba</td>
      <td>Argentina</td>
      <td>2025</td>
      <td>05</td>
      <td>10</td>
    </tr>
    <tr>
      <th>154</th>
      <td>2025-05-24</td>
      <td>Parque de la Ciudad, Buenos Aires, Argentina</td>
      <td>0.369988</td>
      <td>Parque de la Ciudad</td>
      <td>Buenos Aires</td>
      <td>Argentina</td>
      <td>2025</td>
      <td>05</td>
      <td>24</td>
    </tr>
    <tr>
      <th>155</th>
      <td>2025-05-25</td>
      <td>Parque de la Ciudad, Buenos Aires, Argentina</td>
      <td>0.409990</td>
      <td>Parque de la Ciudad</td>
      <td>Buenos Aires</td>
      <td>Argentina</td>
      <td>2025</td>
      <td>05</td>
      <td>25</td>
    </tr>
  </tbody>
</table>
<p>141 rows × 9 columns</p>
</div>
:::
::::

:::: {#679c362a .cell .code execution_count="15"}
``` python
df_conciertos_sin_ineditos['lugar'].unique()
```

::: {.output .execute_result execution_count="15"}
    array(['Costa Chaval, Concordia, Argentina',
           'Microestadio Racing Club, Avellaneda, Argentina',
           'Parque Sarmiento, Buenos Aires, Argentina',
           'Polideportivo Club de Gimnasia y Esgrima La Plata, La Plata, Argentina',
           'Estadio All Boys, Buenos Aires, Argentina',
           'Autocine Villa Gesell, Villa Gesell, Argentina',
           'Estadio Obras Sanitarias, Buenos Aires, Argentina',
           'Estadio Atlanta, Buenos Aires, Argentina',
           'Plaza Moreno, La Plata, Argentina',
           'Estadio Universidad Tecnológica, Santa Fe, Argentina',
           'Estadio General Paz Juniors, Córdoba, Argentina',
           'Estadio Polideportivo Islas Malvinas, Mar del Plata, Argentina',
           'Plaza Próspero Molina, Cosquín, Argentina',
           'El Sitio, Galvez, Argentina',
           'Estadio Abierto del Parque de Mayo, San Juan, Argentina',
           'Estadio Pacífico, Mendoza, Argentina',
           'Coliseo de la Quebrada, La Rioja, Argentina',
           'Gimnasio Cubierto ICM, Chascomús, Argentina',
           'Acrópolis Megadisco, San Salvador de Jujuy, Argentina',
           'Club Bomberos Voluntarios, Bariloche, Argentina',
           'Estadio Huracán, Buenos Aires, Argentina',
           'Balneario Don Roque, Sauce Viejo, Argentina',
           'Anfiteatro del Río Uruguay, Paysandú, Uruguay',
           'Pajas Blancas Center, Córdoba, Argentina',
           'Estadio Villa Luján, San Miguel de Tucumán, Argentina',
           'Estadio Luna Park, Buenos Aires, Argentina',
           'Estadio Socio Fundadores, Comodoro Rivadavia, Argentina',
           'Estadio Roberto Carminatti, Bahía Blanca, Argentina',
           "Estadio Cubierto Newell's Old Boys, Rosario, Argentina",
           'Sala Assaig, Palma de Mallorca, Spain',
           'Patinódromo Municipal, Mar del Plata, Argentina',
           'La Vieja Usina, Córdoba, Argentina',
           'Estadio River Plate, Buenos Aires, Argentina',
           'Estadio Vélez Sarsfield, Buenos Aires, Argentina',
           'Orfeo Superdomo, Córdoba, Argentina',
           'Estación Jujuy, San Salvador de Jujuy, Argentina',
           'Gimnasio Don Bosco, Río Grande, Argentina',
           'Club Ingeniero Huergo, Comodoro Rivadavia, Argentina',
           'Estadio Delmi, Salta, Argentina',
           'Estadio Ferrocarril Oeste, Buenos Aires, Argentina',
           'Estadio Ciudad de La Plata, La Plata, Argentina',
           'Estadio Unión, Santa Fe, Argentina',
           'Obras Sanitarias Outdoor, Buenos Aires, Argentina',
           'Estadio Boca Juniors, Buenos Aires, Argentina',
           'El Santo Disco, Rodeo del Medio, Argentina',
           'Anfiteatro Villa María, Villa María, Argentina',
           'Boxing Club, Río Gallegos, Argentina',
           'Estadio Cayetano Castro, Trelew, Argentina',
           'Club Estudiantes de Olavarría, Olavarría, Argentina',
           'Hipódromo Parque de La Independencia, Rosario, Argentina',
           'Estadio Juniors, Córdoba, Argentina',
           'Estadio Central Córdoba, San Miguel de Tucumán, Argentina',
           'Estadio La Tablada, San Salvador de Jujuy, Argentina',
           'Corporación del Comercio, Bahía Blanca, Argentina',
           'Estadio Ruca Che, Neuquén, Argentina',
           'Comuna San Roque, Cosquín, Argentina',
           'Willie Dixon, Rosario, Argentina',
           'Estadio Chateau Carreras, Córdoba, Argentina',
           'Razzmatazz, Barcelona, Spain', 'Alcatraz, Milan, Italy',
           'Anfiteatro Mario del Tránsito Cocomarola, Corrientes, Argentina',
           'Monumento al Obrero Petrolero, Caleta Olivia, Argentina',
           'Aeródromo Santa María de Punilla, Santa Maria de Punilla, Argentina',
           'Tecnópolis, Villa Martelli, Argentina',
           'Teatro Griego Frank Romero Day, Mendoza, Argentina',
           'Playón Mario Alberto Kempes, Córdoba, Argentina',
           'Parque de la Ciudad, Buenos Aires, Argentina'], dtype=object)
:::
::::

::: {#c2ba849b .cell .code execution_count="16"}
``` python
aforos = {
    'Costa Chaval, Concordia, Argentina': 1500,
    'Microestadio Racing Club, Avellaneda, Argentina': 3500,
    'Parque Sarmiento, Buenos Aires, Argentina': 20000,
    'Polideportivo Club de Gimnasia y Esgrima La Plata, La Plata, Argentina': 3000,
    'Estadio All Boys, Buenos Aires, Argentina': 21000,
    'Autocine Villa Gesell, Villa Gesell, Argentina': 5000,
    'Estadio Obras Sanitarias, Buenos Aires, Argentina': 4700,
    'Estadio Atlanta, Buenos Aires, Argentina': 34000,
    'Plaza Moreno, La Plata, Argentina': 20000,
    'Estadio Universidad Tecnológica, Santa Fe, Argentina': 5000,
    'Estadio General Paz Juniors, Córdoba, Argentina': 11000,
    'Estadio Polideportivo Islas Malvinas, Mar del Plata, Argentina': 7500,
    'Plaza Próspero Molina, Cosquín, Argentina': 10000,
    'El Sitio, Galvez, Argentina': 1000,
    'Estadio Abierto del Parque de Mayo, San Juan, Argentina': 8000,
    'Estadio Pacífico, Mendoza, Argentina': 5000,
    'Coliseo de la Quebrada, La Rioja, Argentina': 7000,
    'Gimnasio Cubierto ICM, Chascomús, Argentina': 2000,
    'Acrópolis Megadisco, San Salvador de Jujuy, Argentina': 1500,
    'Club Bomberos Voluntarios, Bariloche, Argentina': 2000,
    'Estadio Huracán, Buenos Aires, Argentina': 48000,
    'Balneario Don Roque, Sauce Viejo, Argentina': 3000,
    'Anfiteatro del Río Uruguay, Paysandú, Uruguay': 5000,
    'Pajas Blancas Center, Córdoba, Argentina': 2000,
    'Estadio Villa Luján, San Miguel de Tucumán, Argentina': 5000,
    'Estadio Luna Park, Buenos Aires, Argentina': 8000,
    'Estadio Socio Fundadores, Comodoro Rivadavia, Argentina': 3500,
    'Estadio Roberto Carminatti, Bahía Blanca, Argentina': 18000,
    "Estadio Cubierto Newell's Old Boys, Rosario, Argentina": 8000,
    'Sala Assaig, Palma de Mallorca, Spain': 1000,
    'Patinódromo Municipal, Mar del Plata, Argentina': 6000,
    'La Vieja Usina, Córdoba, Argentina': 1200,
    'Estadio River Plate, Buenos Aires, Argentina': 70000,
    'Estadio Vélez Sarsfield, Buenos Aires, Argentina': 50000,
    'Orfeo Superdomo, Córdoba, Argentina': 14000,
    'Estación Jujuy, San Salvador de Jujuy, Argentina': 2000,
    'Gimnasio Don Bosco, Río Grande, Argentina': 1500,
    'Club Ingeniero Huergo, Comodoro Rivadavia, Argentina': 2000,
    'Estadio Delmi, Salta, Argentina': 10000,
    'Estadio Ferrocarril Oeste, Buenos Aires, Argentina': 24000,
    'Estadio Ciudad de La Plata, La Plata, Argentina': 53000,
    'Estadio Unión, Santa Fe, Argentina': 28000,
    'Obras Sanitarias Outdoor, Buenos Aires, Argentina': 8000,
    'Estadio Boca Juniors, Buenos Aires, Argentina': 49000,
    'El Santo Disco, Rodeo del Medio, Argentina': 1500,
    'Anfiteatro Villa María, Villa María, Argentina': 11000,
    'Boxing Club, Río Gallegos, Argentina': 2500,
    'Estadio Cayetano Castro, Trelew, Argentina': 8000,
    'Club Estudiantes de Olavarría, Olavarría, Argentina': 2000,
    'Hipódromo Parque de La Independencia, Rosario, Argentina': 30000,
    'Estadio Juniors, Córdoba, Argentina': 6000,
    'Estadio Central Córdoba, San Miguel de Tucumán, Argentina': 25000,
    'Estadio La Tablada, San Salvador de Jujuy, Argentina': 5000,
    'Corporación del Comercio, Bahía Blanca, Argentina': 1000,
    'Estadio Ruca Che, Neuquén, Argentina': 8500,
    'Comuna San Roque, Cosquín, Argentina': 2000,
    'Willie Dixon, Rosario, Argentina': 1200,
    'Estadio Chateau Carreras, Córdoba, Argentina': 57000,
    'Razzmatazz, Barcelona, Spain': 2000,
    'Alcatraz, Milan, Italy': 3000,
    'Anfiteatro Mario del Tránsito Cocomarola, Corrientes, Argentina': 15000,
    'Monumento al Obrero Petrolero, Caleta Olivia, Argentina': 20000,
    'Aeródromo Santa María de Punilla, Santa Maria de Punilla, Argentina': 60000,
    'Tecnópolis, Villa Martelli, Argentina': 80000,
    'Teatro Griego Frank Romero Day, Mendoza, Argentina': 20000,
    'Playón Mario Alberto Kempes, Córdoba, Argentina': 30000,
    'Parque de la Ciudad, Buenos Aires, Argentina': 50000,
}

df_conciertos_sin_ineditos['aforo'] = df_conciertos_sin_ineditos['lugar'].map(aforos)
    
```
:::

:::: {#1f525358 .cell .code execution_count="17"}
``` python
# ...existing code...

# Definí las zonas según tus criterios
bsas = ['Buenos Aires', 'Villa Martelli', 'Avellaneda']
interior_bsas = [
    'La Plata', 'Villa Gesell' , 'Mar del Plata' , 'Chascomús', 'Bahía Blanca', 'Olavarría']

interior = ['Santa Fe', 'Córdoba', 'Cosquín', 'Galvez', 'San Juan',
    'Mendoza', 'Sauce Viejo', 'Rosario',
    'Rodeo del Medio', 'Villa María',   
    'Caleta Olivia', 'Santa Maria de Punilla', 'Concordia']

interior_sur = ['Bariloche', 'Río Grande', 'Comodoro Rivadavia','Río Gallegos', 'Trelew', 'Neuquén']
interior_norte = ['Corrientes', 'La Rioja', 'San Salvador de Jujuy', 'San Miguel de Tucumán',  'Salta']
exterior = ['Paysandú', 'Palma de Mallorca', 'Barcelona', 'Milan']

def clasificar_zona(localidad):
    localidad = localidad.strip()
    if localidad in bsas:
        return 'Buenos Aires'
    elif localidad in interior_bsas:
        return 'Interior Buenos Aires'
    elif localidad in interior:
        return 'Interior'
    elif localidad in interior_sur:
        return 'Interior Sur'
    elif localidad in interior_norte:
        return 'Interior Norte'
    elif localidad in exterior:
        return 'Exterior'
    else:
        return 'Otra'
    


df_conciertos_sin_ineditos['Zona'] = df_conciertos_sin_ineditos['Localidad'].apply(clasificar_zona)
df_conciertos_sin_ineditos['Zona'] = df_conciertos_sin_ineditos['Zona'].astype('category')

# Ahora la columna 'Zona' es categórica y podés usarla para análisis o gráficos
df_conciertos_sin_ineditos['Zona'].value_counts()
```

::: {.output .execute_result execution_count="17"}
    Zona
    Buenos Aires             52
    Interior                 39
    Interior Buenos Aires    27
    Interior Sur             10
    Interior Norte            8
    Exterior                  5
    Name: count, dtype: int64
:::
::::

:::: {#27f978f7 .cell .code execution_count="18"}
``` python
df_conciertos_sin_ineditos.select_dtypes(include='number').corr()
```

::: {.output .execute_result execution_count="18"}
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
      <th>indice_popularidad_norm</th>
      <th>aforo</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>indice_popularidad_norm</th>
      <td>1.000000</td>
      <td>-0.045461</td>
    </tr>
    <tr>
      <th>aforo</th>
      <td>-0.045461</td>
      <td>1.000000</td>
    </tr>
  </tbody>
</table>
</div>
:::
::::

:::: {#f886938e .cell .code execution_count="19"}
``` python
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder, FunctionTransformer
import numpy as np

# seteamos vars para predecir popularidad 


# Función para categorizar el día en quincena
def quincena_from_day(dias):
    # dias puede ser una Serie o array de strings o ints
    dias = dias.astype(int)
    return np.where(dias <= 15, '1', '2').reshape(-1, 1)

# Suponiendo que el DataFrame de entrada es df_conciertos_sin_ineditos
# y tiene las columnas 'Día', 'aforo', 'Localidad', 'indice_popularidad_norm'

# Preparamos las features
X = df_conciertos_sin_ineditos[['Día', 'aforo', 'Localidad']]
y = df_conciertos_sin_ineditos['indice_popularidad_norm']

# Preprocesadores
preprocessor = ColumnTransformer(
    transformers=[
        ('quincena', FunctionTransformer(quincena_from_day, feature_names_out='one-to-one'), ['Día']),
        ('aforo', 'passthrough', ['aforo']),
        ('localidad', OneHotEncoder(drop='first', sparse_output=False), ['Localidad'])
    ],
    remainder='drop'
)

# Pipeline
pipeline = Pipeline([
    ('pre', preprocessor),
    ('reg', RandomForestRegressor(random_state=42))
])

# Entrenar el pipeline
pipeline.fit(X, y)

```

::: {.output .execute_result execution_count="19"}
<style>#sk-container-id-1 {
  /* Definition of color scheme common for light and dark mode */
  --sklearn-color-text: black;
  --sklearn-color-line: gray;
  /* Definition of color scheme for unfitted estimators */
  --sklearn-color-unfitted-level-0: #fff5e6;
  --sklearn-color-unfitted-level-1: #f6e4d2;
  --sklearn-color-unfitted-level-2: #ffe0b3;
  --sklearn-color-unfitted-level-3: chocolate;
  /* Definition of color scheme for fitted estimators */
  --sklearn-color-fitted-level-0: #f0f8ff;
  --sklearn-color-fitted-level-1: #d4ebff;
  --sklearn-color-fitted-level-2: #b3dbfd;
  --sklearn-color-fitted-level-3: cornflowerblue;

  /* Specific color for light theme */
  --sklearn-color-text-on-default-background: var(--sg-text-color, var(--theme-code-foreground, var(--jp-content-font-color1, black)));
  --sklearn-color-background: var(--sg-background-color, var(--theme-background, var(--jp-layout-color0, white)));
  --sklearn-color-border-box: var(--sg-text-color, var(--theme-code-foreground, var(--jp-content-font-color1, black)));
  --sklearn-color-icon: #696969;

  @media (prefers-color-scheme: dark) {
    /* Redefinition of color scheme for dark theme */
    --sklearn-color-text-on-default-background: var(--sg-text-color, var(--theme-code-foreground, var(--jp-content-font-color1, white)));
    --sklearn-color-background: var(--sg-background-color, var(--theme-background, var(--jp-layout-color0, #111)));
    --sklearn-color-border-box: var(--sg-text-color, var(--theme-code-foreground, var(--jp-content-font-color1, white)));
    --sklearn-color-icon: #878787;
  }
}

#sk-container-id-1 {
  color: var(--sklearn-color-text);
}

#sk-container-id-1 pre {
  padding: 0;
}

#sk-container-id-1 input.sk-hidden--visually {
  border: 0;
  clip: rect(1px 1px 1px 1px);
  clip: rect(1px, 1px, 1px, 1px);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  width: 1px;
}

#sk-container-id-1 div.sk-dashed-wrapped {
  border: 1px dashed var(--sklearn-color-line);
  margin: 0 0.4em 0.5em 0.4em;
  box-sizing: border-box;
  padding-bottom: 0.4em;
  background-color: var(--sklearn-color-background);
}

#sk-container-id-1 div.sk-container {
  /* jupyter's `normalize.less` sets `[hidden] { display: none; }`
     but bootstrap.min.css set `[hidden] { display: none !important; }`
     so we also need the `!important` here to be able to override the
     default hidden behavior on the sphinx rendered scikit-learn.org.
     See: https://github.com/scikit-learn/scikit-learn/issues/21755 */
  display: inline-block !important;
  position: relative;
}

#sk-container-id-1 div.sk-text-repr-fallback {
  display: none;
}

div.sk-parallel-item,
div.sk-serial,
div.sk-item {
  /* draw centered vertical line to link estimators */
  background-image: linear-gradient(var(--sklearn-color-text-on-default-background), var(--sklearn-color-text-on-default-background));
  background-size: 2px 100%;
  background-repeat: no-repeat;
  background-position: center center;
}

/* Parallel-specific style estimator block */

#sk-container-id-1 div.sk-parallel-item::after {
  content: "";
  width: 100%;
  border-bottom: 2px solid var(--sklearn-color-text-on-default-background);
  flex-grow: 1;
}

#sk-container-id-1 div.sk-parallel {
  display: flex;
  align-items: stretch;
  justify-content: center;
  background-color: var(--sklearn-color-background);
  position: relative;
}

#sk-container-id-1 div.sk-parallel-item {
  display: flex;
  flex-direction: column;
}

#sk-container-id-1 div.sk-parallel-item:first-child::after {
  align-self: flex-end;
  width: 50%;
}

#sk-container-id-1 div.sk-parallel-item:last-child::after {
  align-self: flex-start;
  width: 50%;
}

#sk-container-id-1 div.sk-parallel-item:only-child::after {
  width: 0;
}

/* Serial-specific style estimator block */

#sk-container-id-1 div.sk-serial {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--sklearn-color-background);
  padding-right: 1em;
  padding-left: 1em;
}


/* Toggleable style: style used for estimator/Pipeline/ColumnTransformer box that is
clickable and can be expanded/collapsed.
- Pipeline and ColumnTransformer use this feature and define the default style
- Estimators will overwrite some part of the style using the `sk-estimator` class
*/

/* Pipeline and ColumnTransformer style (default) */

#sk-container-id-1 div.sk-toggleable {
  /* Default theme specific background. It is overwritten whether we have a
  specific estimator or a Pipeline/ColumnTransformer */
  background-color: var(--sklearn-color-background);
}

/* Toggleable label */
#sk-container-id-1 label.sk-toggleable__label {
  cursor: pointer;
  display: block;
  width: 100%;
  margin-bottom: 0;
  padding: 0.5em;
  box-sizing: border-box;
  text-align: center;
}

#sk-container-id-1 label.sk-toggleable__label-arrow:before {
  /* Arrow on the left of the label */
  content: "▸";
  float: left;
  margin-right: 0.25em;
  color: var(--sklearn-color-icon);
}

#sk-container-id-1 label.sk-toggleable__label-arrow:hover:before {
  color: var(--sklearn-color-text);
}

/* Toggleable content - dropdown */

#sk-container-id-1 div.sk-toggleable__content {
  max-height: 0;
  max-width: 0;
  overflow: hidden;
  text-align: left;
  /* unfitted */
  background-color: var(--sklearn-color-unfitted-level-0);
}

#sk-container-id-1 div.sk-toggleable__content.fitted {
  /* fitted */
  background-color: var(--sklearn-color-fitted-level-0);
}

#sk-container-id-1 div.sk-toggleable__content pre {
  margin: 0.2em;
  border-radius: 0.25em;
  color: var(--sklearn-color-text);
  /* unfitted */
  background-color: var(--sklearn-color-unfitted-level-0);
}

#sk-container-id-1 div.sk-toggleable__content.fitted pre {
  /* unfitted */
  background-color: var(--sklearn-color-fitted-level-0);
}

#sk-container-id-1 input.sk-toggleable__control:checked~div.sk-toggleable__content {
  /* Expand drop-down */
  max-height: 200px;
  max-width: 100%;
  overflow: auto;
}

#sk-container-id-1 input.sk-toggleable__control:checked~label.sk-toggleable__label-arrow:before {
  content: "▾";
}

/* Pipeline/ColumnTransformer-specific style */

#sk-container-id-1 div.sk-label input.sk-toggleable__control:checked~label.sk-toggleable__label {
  color: var(--sklearn-color-text);
  background-color: var(--sklearn-color-unfitted-level-2);
}

#sk-container-id-1 div.sk-label.fitted input.sk-toggleable__control:checked~label.sk-toggleable__label {
  background-color: var(--sklearn-color-fitted-level-2);
}

/* Estimator-specific style */

/* Colorize estimator box */
#sk-container-id-1 div.sk-estimator input.sk-toggleable__control:checked~label.sk-toggleable__label {
  /* unfitted */
  background-color: var(--sklearn-color-unfitted-level-2);
}

#sk-container-id-1 div.sk-estimator.fitted input.sk-toggleable__control:checked~label.sk-toggleable__label {
  /* fitted */
  background-color: var(--sklearn-color-fitted-level-2);
}

#sk-container-id-1 div.sk-label label.sk-toggleable__label,
#sk-container-id-1 div.sk-label label {
  /* The background is the default theme color */
  color: var(--sklearn-color-text-on-default-background);
}

/* On hover, darken the color of the background */
#sk-container-id-1 div.sk-label:hover label.sk-toggleable__label {
  color: var(--sklearn-color-text);
  background-color: var(--sklearn-color-unfitted-level-2);
}

/* Label box, darken color on hover, fitted */
#sk-container-id-1 div.sk-label.fitted:hover label.sk-toggleable__label.fitted {
  color: var(--sklearn-color-text);
  background-color: var(--sklearn-color-fitted-level-2);
}

/* Estimator label */

#sk-container-id-1 div.sk-label label {
  font-family: monospace;
  font-weight: bold;
  display: inline-block;
  line-height: 1.2em;
}

#sk-container-id-1 div.sk-label-container {
  text-align: center;
}

/* Estimator-specific */
#sk-container-id-1 div.sk-estimator {
  font-family: monospace;
  border: 1px dotted var(--sklearn-color-border-box);
  border-radius: 0.25em;
  box-sizing: border-box;
  margin-bottom: 0.5em;
  /* unfitted */
  background-color: var(--sklearn-color-unfitted-level-0);
}

#sk-container-id-1 div.sk-estimator.fitted {
  /* fitted */
  background-color: var(--sklearn-color-fitted-level-0);
}

/* on hover */
#sk-container-id-1 div.sk-estimator:hover {
  /* unfitted */
  background-color: var(--sklearn-color-unfitted-level-2);
}

#sk-container-id-1 div.sk-estimator.fitted:hover {
  /* fitted */
  background-color: var(--sklearn-color-fitted-level-2);
}

/* Specification for estimator info (e.g. "i" and "?") */

/* Common style for "i" and "?" */

.sk-estimator-doc-link,
a:link.sk-estimator-doc-link,
a:visited.sk-estimator-doc-link {
  float: right;
  font-size: smaller;
  line-height: 1em;
  font-family: monospace;
  background-color: var(--sklearn-color-background);
  border-radius: 1em;
  height: 1em;
  width: 1em;
  text-decoration: none !important;
  margin-left: 1ex;
  /* unfitted */
  border: var(--sklearn-color-unfitted-level-1) 1pt solid;
  color: var(--sklearn-color-unfitted-level-1);
}

.sk-estimator-doc-link.fitted,
a:link.sk-estimator-doc-link.fitted,
a:visited.sk-estimator-doc-link.fitted {
  /* fitted */
  border: var(--sklearn-color-fitted-level-1) 1pt solid;
  color: var(--sklearn-color-fitted-level-1);
}

/* On hover */
div.sk-estimator:hover .sk-estimator-doc-link:hover,
.sk-estimator-doc-link:hover,
div.sk-label-container:hover .sk-estimator-doc-link:hover,
.sk-estimator-doc-link:hover {
  /* unfitted */
  background-color: var(--sklearn-color-unfitted-level-3);
  color: var(--sklearn-color-background);
  text-decoration: none;
}

div.sk-estimator.fitted:hover .sk-estimator-doc-link.fitted:hover,
.sk-estimator-doc-link.fitted:hover,
div.sk-label-container:hover .sk-estimator-doc-link.fitted:hover,
.sk-estimator-doc-link.fitted:hover {
  /* fitted */
  background-color: var(--sklearn-color-fitted-level-3);
  color: var(--sklearn-color-background);
  text-decoration: none;
}

/* Span, style for the box shown on hovering the info icon */
.sk-estimator-doc-link span {
  display: none;
  z-index: 9999;
  position: relative;
  font-weight: normal;
  right: .2ex;
  padding: .5ex;
  margin: .5ex;
  width: min-content;
  min-width: 20ex;
  max-width: 50ex;
  color: var(--sklearn-color-text);
  box-shadow: 2pt 2pt 4pt #999;
  /* unfitted */
  background: var(--sklearn-color-unfitted-level-0);
  border: .5pt solid var(--sklearn-color-unfitted-level-3);
}

.sk-estimator-doc-link.fitted span {
  /* fitted */
  background: var(--sklearn-color-fitted-level-0);
  border: var(--sklearn-color-fitted-level-3);
}

.sk-estimator-doc-link:hover span {
  display: block;
}

/* "?"-specific style due to the `<a>` HTML tag */

#sk-container-id-1 a.estimator_doc_link {
  float: right;
  font-size: 1rem;
  line-height: 1em;
  font-family: monospace;
  background-color: var(--sklearn-color-background);
  border-radius: 1rem;
  height: 1rem;
  width: 1rem;
  text-decoration: none;
  /* unfitted */
  color: var(--sklearn-color-unfitted-level-1);
  border: var(--sklearn-color-unfitted-level-1) 1pt solid;
}

#sk-container-id-1 a.estimator_doc_link.fitted {
  /* fitted */
  border: var(--sklearn-color-fitted-level-1) 1pt solid;
  color: var(--sklearn-color-fitted-level-1);
}

/* On hover */
#sk-container-id-1 a.estimator_doc_link:hover {
  /* unfitted */
  background-color: var(--sklearn-color-unfitted-level-3);
  color: var(--sklearn-color-background);
  text-decoration: none;
}

#sk-container-id-1 a.estimator_doc_link.fitted:hover {
  /* fitted */
  background-color: var(--sklearn-color-fitted-level-3);
}
</style><div id="sk-container-id-1" class="sk-top-container"><div class="sk-text-repr-fallback"><pre>Pipeline(steps=[(&#x27;pre&#x27;,
                 ColumnTransformer(transformers=[(&#x27;quincena&#x27;,
                                                  FunctionTransformer(feature_names_out=&#x27;one-to-one&#x27;,
                                                                      func=&lt;function quincena_from_day at 0x0000026B072AFBA0&gt;),
                                                  [&#x27;Día&#x27;]),
                                                 (&#x27;aforo&#x27;, &#x27;passthrough&#x27;,
                                                  [&#x27;aforo&#x27;]),
                                                 (&#x27;localidad&#x27;,
                                                  OneHotEncoder(drop=&#x27;first&#x27;,
                                                                sparse_output=False),
                                                  [&#x27;Localidad&#x27;])])),
                (&#x27;reg&#x27;, RandomForestRegressor(random_state=42))])</pre><b>In a Jupyter environment, please rerun this cell to show the HTML representation or trust the notebook. <br />On GitHub, the HTML representation is unable to render, please try loading this page with nbviewer.org.</b></div><div class="sk-container" hidden><div class="sk-item sk-dashed-wrapped"><div class="sk-label-container"><div class="sk-label fitted sk-toggleable"><input class="sk-toggleable__control sk-hidden--visually" id="sk-estimator-id-1" type="checkbox" ><label for="sk-estimator-id-1" class="sk-toggleable__label fitted sk-toggleable__label-arrow fitted">&nbsp;&nbsp;Pipeline<a class="sk-estimator-doc-link fitted" rel="noreferrer" target="_blank" href="https://scikit-learn.org/1.4/modules/generated/sklearn.pipeline.Pipeline.html">?<span>Documentation for Pipeline</span></a><span class="sk-estimator-doc-link fitted">i<span>Fitted</span></span></label><div class="sk-toggleable__content fitted"><pre>Pipeline(steps=[(&#x27;pre&#x27;,
                 ColumnTransformer(transformers=[(&#x27;quincena&#x27;,
                                                  FunctionTransformer(feature_names_out=&#x27;one-to-one&#x27;,
                                                                      func=&lt;function quincena_from_day at 0x0000026B072AFBA0&gt;),
                                                  [&#x27;Día&#x27;]),
                                                 (&#x27;aforo&#x27;, &#x27;passthrough&#x27;,
                                                  [&#x27;aforo&#x27;]),
                                                 (&#x27;localidad&#x27;,
                                                  OneHotEncoder(drop=&#x27;first&#x27;,
                                                                sparse_output=False),
                                                  [&#x27;Localidad&#x27;])])),
                (&#x27;reg&#x27;, RandomForestRegressor(random_state=42))])</pre></div> </div></div><div class="sk-serial"><div class="sk-item sk-dashed-wrapped"><div class="sk-label-container"><div class="sk-label fitted sk-toggleable"><input class="sk-toggleable__control sk-hidden--visually" id="sk-estimator-id-2" type="checkbox" ><label for="sk-estimator-id-2" class="sk-toggleable__label fitted sk-toggleable__label-arrow fitted">&nbsp;pre: ColumnTransformer<a class="sk-estimator-doc-link fitted" rel="noreferrer" target="_blank" href="https://scikit-learn.org/1.4/modules/generated/sklearn.compose.ColumnTransformer.html">?<span>Documentation for pre: ColumnTransformer</span></a></label><div class="sk-toggleable__content fitted"><pre>ColumnTransformer(transformers=[(&#x27;quincena&#x27;,
                                 FunctionTransformer(feature_names_out=&#x27;one-to-one&#x27;,
                                                     func=&lt;function quincena_from_day at 0x0000026B072AFBA0&gt;),
                                 [&#x27;Día&#x27;]),
                                (&#x27;aforo&#x27;, &#x27;passthrough&#x27;, [&#x27;aforo&#x27;]),
                                (&#x27;localidad&#x27;,
                                 OneHotEncoder(drop=&#x27;first&#x27;,
                                               sparse_output=False),
                                 [&#x27;Localidad&#x27;])])</pre></div> </div></div><div class="sk-parallel"><div class="sk-parallel-item"><div class="sk-item"><div class="sk-label-container"><div class="sk-label fitted sk-toggleable"><input class="sk-toggleable__control sk-hidden--visually" id="sk-estimator-id-3" type="checkbox" ><label for="sk-estimator-id-3" class="sk-toggleable__label fitted sk-toggleable__label-arrow fitted">quincena</label><div class="sk-toggleable__content fitted"><pre>[&#x27;Día&#x27;]</pre></div> </div></div><div class="sk-serial"><div class="sk-item"><div class="sk-estimator fitted sk-toggleable"><input class="sk-toggleable__control sk-hidden--visually" id="sk-estimator-id-4" type="checkbox" ><label for="sk-estimator-id-4" class="sk-toggleable__label fitted sk-toggleable__label-arrow fitted">&nbsp;FunctionTransformer<a class="sk-estimator-doc-link fitted" rel="noreferrer" target="_blank" href="https://scikit-learn.org/1.4/modules/generated/sklearn.preprocessing.FunctionTransformer.html">?<span>Documentation for FunctionTransformer</span></a></label><div class="sk-toggleable__content fitted"><pre>FunctionTransformer(feature_names_out=&#x27;one-to-one&#x27;,
                    func=&lt;function quincena_from_day at 0x0000026B072AFBA0&gt;)</pre></div> </div></div></div></div></div><div class="sk-parallel-item"><div class="sk-item"><div class="sk-label-container"><div class="sk-label fitted sk-toggleable"><input class="sk-toggleable__control sk-hidden--visually" id="sk-estimator-id-5" type="checkbox" ><label for="sk-estimator-id-5" class="sk-toggleable__label fitted sk-toggleable__label-arrow fitted">aforo</label><div class="sk-toggleable__content fitted"><pre>[&#x27;aforo&#x27;]</pre></div> </div></div><div class="sk-serial"><div class="sk-item"><div class="sk-estimator fitted sk-toggleable"><input class="sk-toggleable__control sk-hidden--visually" id="sk-estimator-id-6" type="checkbox" ><label for="sk-estimator-id-6" class="sk-toggleable__label fitted sk-toggleable__label-arrow fitted">passthrough</label><div class="sk-toggleable__content fitted"><pre>passthrough</pre></div> </div></div></div></div></div><div class="sk-parallel-item"><div class="sk-item"><div class="sk-label-container"><div class="sk-label fitted sk-toggleable"><input class="sk-toggleable__control sk-hidden--visually" id="sk-estimator-id-7" type="checkbox" ><label for="sk-estimator-id-7" class="sk-toggleable__label fitted sk-toggleable__label-arrow fitted">localidad</label><div class="sk-toggleable__content fitted"><pre>[&#x27;Localidad&#x27;]</pre></div> </div></div><div class="sk-serial"><div class="sk-item"><div class="sk-estimator fitted sk-toggleable"><input class="sk-toggleable__control sk-hidden--visually" id="sk-estimator-id-8" type="checkbox" ><label for="sk-estimator-id-8" class="sk-toggleable__label fitted sk-toggleable__label-arrow fitted">&nbsp;OneHotEncoder<a class="sk-estimator-doc-link fitted" rel="noreferrer" target="_blank" href="https://scikit-learn.org/1.4/modules/generated/sklearn.preprocessing.OneHotEncoder.html">?<span>Documentation for OneHotEncoder</span></a></label><div class="sk-toggleable__content fitted"><pre>OneHotEncoder(drop=&#x27;first&#x27;, sparse_output=False)</pre></div> </div></div></div></div></div></div></div><div class="sk-item"><div class="sk-estimator fitted sk-toggleable"><input class="sk-toggleable__control sk-hidden--visually" id="sk-estimator-id-9" type="checkbox" ><label for="sk-estimator-id-9" class="sk-toggleable__label fitted sk-toggleable__label-arrow fitted">&nbsp;RandomForestRegressor<a class="sk-estimator-doc-link fitted" rel="noreferrer" target="_blank" href="https://scikit-learn.org/1.4/modules/generated/sklearn.ensemble.RandomForestRegressor.html">?<span>Documentation for RandomForestRegressor</span></a></label><div class="sk-toggleable__content fitted"><pre>RandomForestRegressor(random_state=42)</pre></div> </div></div></div></div></div></div>
:::
::::

:::: {#9db1b08f .cell .code execution_count="20"}
``` python
# Evaluar el modelo
from sklearn.metrics import mean_squared_error, r2_score
y_pred = pipeline.predict(X)
mse = mean_squared_error(y, y_pred)
r2 = r2_score(y, y_pred)
print(f'Mean Squared Error: {mse}')
print(f'R^2 Score: {r2}')
```

::: {.output .stream .stdout}
    Mean Squared Error: 0.0006806220392995918
    R^2 Score: 0.7813045344130563
:::
::::

:::: {#a5c78059 .cell .code execution_count="21"}
``` python
# escala de la variable objetivo

df_conciertos_sin_ineditos['indice_popularidad_norm'].describe()
```

::: {.output .execute_result execution_count="21"}
    count    141.000000
    mean       0.430426
    std        0.055986
    min        0.322628
    25%        0.385355
    50%        0.428116
    75%        0.464774
    max        0.579356
    Name: indice_popularidad_norm, dtype: float64
:::
::::

::: {#1b8d1c93 .cell .code execution_count="22"}
``` python
import pandas as pd
import json

# Cargar el JSON
with open('Setlists_Piojos.json', 'r', encoding='utf-8') as f:
    setlists_data = json.load(f)

# Convertir a DataFrame
df_setlists = pd.DataFrame(setlists_data)

# Crear columna de fecha para mergear (asegurate que el formato coincida con tu df principal)
df_setlists['fecha'] = df_setlists.apply(lambda row: f"{row['year']}-{row['month']:02d}-{row['day']:02d}", axis=1)
df_setlists['lugar'] = df_setlists['venue']

# Dejá solo las columnas que te interesan
df_setlists = df_setlists[['fecha', 'lugar', 'songs']].rename(columns={'songs': 'canciones_show'})

# Mergeá con tu DataFrame principal (por fecha y lugar)
df_conciertos_sin_ineditos = df_conciertos_sin_ineditos.merge(df_setlists, on=['fecha', 'lugar'], how='left')
```
:::

:::: {#df082837 .cell .code execution_count="23"}
``` python
df_conciertos_sin_ineditos['cantidad_canciones'] = df_conciertos_sin_ineditos['canciones_show'].apply(lambda x: len(x) if isinstance(x, list) else 0)
df_conciertos_sin_ineditos
```

::: {.output .execute_result execution_count="23"}
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
      <th>lugar</th>
      <th>indice_popularidad_norm</th>
      <th>Lugar</th>
      <th>Localidad</th>
      <th>País</th>
      <th>Año</th>
      <th>Mes</th>
      <th>Día</th>
      <th>aforo</th>
      <th>Zona</th>
      <th>canciones_show</th>
      <th>cantidad_canciones</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>1997-03-29</td>
      <td>Costa Chaval, Concordia, Argentina</td>
      <td>0.378780</td>
      <td>Costa Chaval</td>
      <td>Concordia</td>
      <td>Argentina</td>
      <td>1997</td>
      <td>03</td>
      <td>29</td>
      <td>1500</td>
      <td>Interior</td>
      <td>[Ximenita, Taxi Boy, Babilonia, Ay ay ay, Gris...</td>
      <td>26</td>
    </tr>
    <tr>
      <th>1</th>
      <td>1997-07-18</td>
      <td>Microestadio Racing Club, Avellaneda, Argentina</td>
      <td>0.358387</td>
      <td>Microestadio Racing Club</td>
      <td>Avellaneda</td>
      <td>Argentina</td>
      <td>1997</td>
      <td>07</td>
      <td>18</td>
      <td>3500</td>
      <td>Buenos Aires</td>
      <td>[Arco, Babilonia, Ay ay ay, Gris, Angelito, Ge...</td>
      <td>23</td>
    </tr>
    <tr>
      <th>2</th>
      <td>1997-07-19</td>
      <td>Microestadio Racing Club, Avellaneda, Argentina</td>
      <td>0.367850</td>
      <td>Microestadio Racing Club</td>
      <td>Avellaneda</td>
      <td>Argentina</td>
      <td>1997</td>
      <td>07</td>
      <td>19</td>
      <td>3500</td>
      <td>Buenos Aires</td>
      <td>[Chac tu chac, Ximenita, Taxi Boy, Gris, Muy d...</td>
      <td>24</td>
    </tr>
    <tr>
      <th>3</th>
      <td>1998-05-17</td>
      <td>Parque Sarmiento, Buenos Aires, Argentina</td>
      <td>0.354167</td>
      <td>Parque Sarmiento</td>
      <td>Buenos Aires</td>
      <td>Argentina</td>
      <td>1998</td>
      <td>05</td>
      <td>17</td>
      <td>20000</td>
      <td>Buenos Aires</td>
      <td>[Yira yira, Babilonia, Taxi Boy, Vals inicial,...</td>
      <td>26</td>
    </tr>
    <tr>
      <th>4</th>
      <td>1998-08-22</td>
      <td>Polideportivo Club de Gimnasia y Esgrima La Pl...</td>
      <td>0.336848</td>
      <td>Polideportivo Club de Gimnasia y Esgrima La Plata</td>
      <td>La Plata</td>
      <td>Argentina</td>
      <td>1998</td>
      <td>08</td>
      <td>22</td>
      <td>3000</td>
      <td>Interior Buenos Aires</td>
      <td>[Babilonia, Yira yira, Desde lejos no se ve, T...</td>
      <td>26</td>
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
      <th>136</th>
      <td>2025-04-26</td>
      <td>Hipódromo Parque de La Independencia, Rosario,...</td>
      <td>0.466426</td>
      <td>Hipódromo Parque de La Independencia</td>
      <td>Rosario</td>
      <td>Argentina</td>
      <td>2025</td>
      <td>04</td>
      <td>26</td>
      <td>30000</td>
      <td>Interior</td>
      <td>[Llévatelo, María y José, Desde lejos no se ve...</td>
      <td>28</td>
    </tr>
    <tr>
      <th>137</th>
      <td>2025-05-03</td>
      <td>Teatro Griego Frank Romero Day, Mendoza, Argen...</td>
      <td>0.474947</td>
      <td>Teatro Griego Frank Romero Day</td>
      <td>Mendoza</td>
      <td>Argentina</td>
      <td>2025</td>
      <td>05</td>
      <td>03</td>
      <td>20000</td>
      <td>Interior</td>
      <td>[Ruleta, Arco, Yira yira, Vine hasta aquí, Civ...</td>
      <td>31</td>
    </tr>
    <tr>
      <th>138</th>
      <td>2025-05-10</td>
      <td>Playón Mario Alberto Kempes, Córdoba, Argentina</td>
      <td>0.486439</td>
      <td>Playón Mario Alberto Kempes</td>
      <td>Córdoba</td>
      <td>Argentina</td>
      <td>2025</td>
      <td>05</td>
      <td>10</td>
      <td>30000</td>
      <td>Interior</td>
      <td>[Fantasma, Desde lejos no se ve, Ruleta, Civil...</td>
      <td>29</td>
    </tr>
    <tr>
      <th>139</th>
      <td>2025-05-24</td>
      <td>Parque de la Ciudad, Buenos Aires, Argentina</td>
      <td>0.369988</td>
      <td>Parque de la Ciudad</td>
      <td>Buenos Aires</td>
      <td>Argentina</td>
      <td>2025</td>
      <td>05</td>
      <td>24</td>
      <td>50000</td>
      <td>Buenos Aires</td>
      <td>[Unbekannt, El balneario de los doctores croto...</td>
      <td>30</td>
    </tr>
    <tr>
      <th>140</th>
      <td>2025-05-25</td>
      <td>Parque de la Ciudad, Buenos Aires, Argentina</td>
      <td>0.409990</td>
      <td>Parque de la Ciudad</td>
      <td>Buenos Aires</td>
      <td>Argentina</td>
      <td>2025</td>
      <td>05</td>
      <td>25</td>
      <td>50000</td>
      <td>Buenos Aires</td>
      <td>[Unbekannt, Desde lejos no se ve, Ruleta, Difí...</td>
      <td>33</td>
    </tr>
  </tbody>
</table>
<p>141 rows × 13 columns</p>
</div>
:::
::::

::: {#c6976be2 .cell .code execution_count="24"}
``` python
# Definí qué es un "hit" (top 25% más populares)
umbral_hit = df_popularidad['indice_popularidad_norm'].quantile(0.75)
hits = set(df_popularidad[df_popularidad['indice_popularidad_norm'] >= umbral_hit]['cancion_norm'])

def proporcion_hits(canciones):
    if not isinstance(canciones, list) or len(canciones) == 0:
        return 0
    canciones_norm = [normalize(c) for c in canciones]
    return sum(c in hits for c in canciones_norm) / len(canciones_norm)

df_conciertos_sin_ineditos['proporcion_hits'] = df_conciertos_sin_ineditos['canciones_show'].apply(proporcion_hits)
```
:::

::: {#83bd00d1 .cell .code execution_count="25"}
``` python
import calendar

df_conciertos_sin_ineditos['Año'] = df_conciertos_sin_ineditos['fecha'].str[:4].astype(int)
df_conciertos_sin_ineditos['Mes'] = df_conciertos_sin_ineditos['fecha'].str[5:7].astype(int)
df_conciertos_sin_ineditos['Día'] = df_conciertos_sin_ineditos['fecha'].str[8:10].astype(int)
df_conciertos_sin_ineditos['DíaSemana'] = pd.to_datetime(df_conciertos_sin_ineditos['fecha']).dt.day_name()

# Estación
def get_estacion(mes):
    if mes in [12, 1, 2]:
        return 'Verano'
    elif mes in [3, 4, 5]:
        return 'Otoño'
    elif mes in [6, 7, 8]:
        return 'Invierno'
    else:
        return 'Primavera'

df_conciertos_sin_ineditos['Estacion'] = df_conciertos_sin_ineditos['Mes'].apply(get_estacion)
```
:::

::: {#90c8bb68 .cell .code execution_count="26"}
``` python
festivales = ['Cosquín Rock', 'Quilmes Rock', 'Personal Fest']  # agregá los que tengas
df_conciertos_sin_ineditos['es_festival'] = df_conciertos_sin_ineditos['lugar'].apply(
    lambda x: any(fest in x for fest in festivales)
)
```
:::

::::: {#ed727cfa .cell .code execution_count="27"}
``` python
import seaborn as sns
import matplotlib.pyplot as plt

tabla = pd.pivot_table(df_conciertos_sin_ineditos, values='indice_popularidad_norm', index='Año', columns='Zona')
plt.figure(figsize=(12,6))
sns.heatmap(tabla, cmap='YlGnBu')
plt.title('Popularidad promedio por año y ciudad')
plt.show()
```

::: {.output .stream .stderr}
    C:\Users\Yo\AppData\Local\Temp\ipykernel_2780\2661234499.py:4: FutureWarning: The default value of observed=False is deprecated and will change to observed=True in a future version of pandas. Specify observed=False to silence this warning and retain the current behavior
      tabla = pd.pivot_table(df_conciertos_sin_ineditos, values='indice_popularidad_norm', index='Año', columns='Zona')
:::

::: {.output .display_data}
![](fab2c9a9f63e9d717f9978532c2f5065a961e2bf.png)
:::
:::::

:::: {#df9406ec .cell .code execution_count="28"}
``` python
import numpy as np

# Reemplaza los valores entre 2009 y 2023 por NaN para romper la línea
serie = df_conciertos_sin_ineditos.groupby('Año')['indice_popularidad_norm'].mean()
serie_filtrada = serie.copy()
serie_filtrada.loc[serie_filtrada.index.to_series().between(2009, 2023)] = np.nan

serie_filtrada.plot(marker='o')
plt.title('Evolución de la popularidad promedio')
plt.ylabel('Popularidad normalizada')
plt.show()
```

::: {.output .display_data}
![](d63d343976f0d7cbdca6eb14b2f467020e6a1a5b.png)
:::
::::

::: {#a1b25fe8 .cell .code}
``` python
from wordcloud import WordCloud, STOPWORDS
from PIL import Image



# Si ya tenés un DataFrame con canciones y su cantidad de veces tocada:
# Supongamos que se llama df_canciones y tiene columnas 'cancion' y 'veces_tocada'

# Expandir la lista 'todas' a partir del DataFrame
todas = []
for idx, row in df_popularidad.iterrows():
    todas.extend([row['canción']] * int(row['veces_tocada']))
    
# Normalizar las canciones para asegurar consistencia
todas = [normalize(song) for song in todas]
# Eliminar duplicados

# Diccionario manual de colores por álbum
album_colors = {
    "Chac Tu Chac": "#694c47",
    "Ay Ay Ay": "#c91a1a",
    "3er Arco": "#f0a924",
    "Azul": "#3476b5",
    "Verde Paisaje del Infierno": "#557346",
    "Maquina de Sangre": "#fa823e",
    "Civilizacion": "#d7c391",
    "Ineditos": "#979c9c"
}

# Asignar color a cada canción según su álbum
color_dict = {}
for song in todas:
    norm_song = normalize(song)
    album = song_to_album.get(norm_song, "Ineditos")
    color_dict[norm_song] = album_colors.get(album, "#000000")




# Ahora, para cada canción, buscamos el color de su álbum
color_dict = {normalize(song): album_colors.get(song_to_album.get(normalize(song), "Ineditos"), "#000000") for song in todas}



def color_asignado(cancion, font_size, position, orientation, font_path, random_state):
    return color_dict.get(cancion, "#000000")

```
:::

::: {#73d42218 .cell .code execution_count="65"}
``` python
from collections import Counter
from PIL import Image, ImageOps, ImageFilter

los_piojos = r'C:\Users\Yo\AppData\Local\Microsoft\Windows\Fonts\Los_Piojos.ttf'

logo_path = r"C:\Users\Yo\Downloads\576e4d7b40b73db09a3c22973ab3da9f.jpg"

img = Image.open(logo_path).convert("L")
mask = np.array(img)

# 2. Invertí la máscara: palabras SOLO en lo negro
mask = np.where(mask > 128, 0, 255).astype(np.uint8)



# Contar la frecuencia de cada canción
freq = Counter(todas)

# Encontrar las 10 más frecuentes
top_n = 200
top_canciones = [c for c, _ in freq.most_common(top_n)]

# Multiplicar su frecuencia (por ejemplo, x2)
for c in top_canciones:
    freq[c] = int(freq[c] * 2)
```
:::

:::: {#54b0a897 .cell .code execution_count="69"}
``` python

wc = WordCloud(
    background_color='white',
    color_func=color_asignado,  # Si ya tenés una función que asigna colores personalizados
    width=1600,
    height=900,
    prefer_horizontal=0.95,
    font_path=los_piojos,  # Podés poner una fuente .ttf si querés una estética especial
    max_words=200,
    min_font_size=10,
    max_font_size=180,
    collocations=False,
    contour_width=1,
    margin=2,
    stopwords=STOPWORDS.union({'de', 'la', 'el'}),  # O ajustá a tus textos
    scale=2,  # Mejora resolución sin cambiar tamaño del archivo final
    normalize_plurals=True,
    repeat=False,
    relative_scaling=0.7,
    mask=mask  # Solo si querés usar una forma personalizada
)

wc.generate_from_frequencies(freq)

```

::: {.output .execute_result execution_count="69"}
    <wordcloud.wordcloud.WordCloud at 0x26b0ba05d90>
:::
::::

:::: {#072671c2 .cell .code execution_count="70"}
``` python
from PIL import Image



# 1. Cargá el logo (JPG, fondo blanco)
logo = Image.open(r"C:\Users\Yo\Downloads\576e4d7b40b73db09a3c22973ab3da9f.jpg").convert("RGBA")
datas = logo.getdata()
wc_img = wc.to_array()
# 2. Hacé transparente el blanco
newData = []
for item in datas:
    # Si es casi blanco, lo hacemos transparente
    if item[0] > 200 and item[1] > 200 and item[2] > 200:
        newData.append((255, 255, 255, 0))
    else:
        newData.append(item)
logo.putdata(newData)

# 3. Redimensioná y superponé como antes
logo = logo.resize((wc_img.shape[1], wc_img.shape[0]))
wc_pil = Image.fromarray(wc_img).convert("RGBA")
final = Image.alpha_composite(wc_pil, logo)

plt.figure(figsize=(16, 9))
plt.imshow(final)
plt.axis('off')
plt.tight_layout(pad=0)
plt.show()
```

::: {.output .display_data}
![](757a22d05c255e20f05fb0f0439d0ba435cf29c8.png)
:::
::::

:::: {#749762cc .cell .code execution_count="105"}
``` python
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder, FunctionTransformer
import numpy as np

# Elegí las columnas que vas a usar
features = [
    'cantidad_canciones', 'aforo', 'Mes',
    'DíaSemana', 'Estacion', 'Zona'
]

X = df_conciertos_sin_ineditos[features]
y = df_conciertos_sin_ineditos['indice_popularidad_norm']

# Preprocesador para variables categóricas
categorical = ['DíaSemana', 'Estacion', 'Zona']
preprocessor = ColumnTransformer(
    transformers=[
        ('cat', OneHotEncoder(drop='first', sparse_output=False), categorical)
    ],
    remainder='passthrough'
)

# Pipeline con RandomForest
pipeline = Pipeline([
    ('pre', preprocessor),
    ('reg', RandomForestRegressor(random_state=42))
])

pipeline.fit(X, y)

# Evaluación
from sklearn.metrics import mean_squared_error, r2_score
y_pred = pipeline.predict(X)
print('MSE:', mean_squared_error(y, y_pred))
print('R2:', r2_score(y, y_pred))
```

::: {.output .stream .stdout}
    MSE: 0.00021621324047820258
    R2: 0.9305269994766819
:::
::::

:::: {#59dda273 .cell .code execution_count="106"}
``` python
# Ver importancia de las variables
importances = pipeline.named_steps['reg'].feature_importances_
feature_names = preprocessor.get_feature_names_out(features)
importance_df = pd.DataFrame({
    'feature': feature_names,
    'importance': importances
}).sort_values(by='importance', ascending=False)
print(importance_df)
```

::: {.output .stream .stdout}
                                feature  importance
    14    remainder__cantidad_canciones    0.324236
    15                 remainder__aforo    0.206133
    16                   remainder__Mes    0.112826
    10               cat__Zona_Interior    0.067324
    13           cat__Zona_Interior Sur    0.059626
    7           cat__Estacion_Primavera    0.057283
    9                cat__Zona_Exterior    0.029062
    1           cat__DíaSemana_Saturday    0.020764
    2             cat__DíaSemana_Sunday    0.019564
    6               cat__Estacion_Otoño    0.018831
    11  cat__Zona_Interior Buenos Aires    0.018445
    0             cat__DíaSemana_Monday    0.017231
    3           cat__DíaSemana_Thursday    0.010945
    8              cat__Estacion_Verano    0.010873
    12         cat__Zona_Interior Norte    0.010692
    4            cat__DíaSemana_Tuesday    0.010328
    5          cat__DíaSemana_Wednesday    0.005836
:::
::::

:::: {#063714ac .cell .code execution_count="113"}
``` python
def mejor_combinacion(estacion=None, zona=None, dia_semana=None, aforo=None):
    """    Encuentra la mejor combinación de variables para maximizar la popularidad predicha.
    Args:
        estacion (str): Estación del año (Verano, Otoño, Invierno, Primavera).
        zona (str): Zona geográfica (Buenos Aires, Interior Buenos Aires, Interior, etc.).
        dia_semana (str): Día de la semana (Monday, Tuesday, etc.).
        aforo (int): Aforo del lugar del concierto.
    Returns:
        pd.Series: La mejor combinación de variables con la popularidad predicha.
    """
    # Valores posibles
    dias_semana = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    estaciones = ['Verano', 'Otoño', 'Invierno', 'Primavera']
    zonas = df_conciertos_sin_ineditos['Zona'].cat.categories.tolist()
    aforos = df_conciertos_sin_ineditos['aforo'].unique().tolist()

    # Valores típicos para numéricas
    cantidad_canciones = int(df_conciertos_sin_ineditos['cantidad_canciones'].mean())
    aforo = int(df_conciertos_sin_ineditos['aforo'].max())
    mes = 1

    # Fijar los valores dados, variar los otros
    if estacion is not None:
        estaciones = [estacion]
    if zona is not None:
        zonas = [zona]
    if dia_semana is not None:
        dias_semana = [dia_semana]
    if aforos is not None:
        aforos = [aforo]
    

    # Todas las combinaciones posibles de los libres
    import itertools
    combinaciones = list(itertools.product(dias_semana, estaciones, zonas, festivales))

    # DataFrame de simulación
    df_sim = pd.DataFrame([
        {
            'cantidad_canciones': cantidad_canciones,
            'aforo': aforo,
            'Mes': mes,
            'DíaSemana': dsem,
            'Estacion': est,
            'Zona': z,
        }
        for dsem, est, z, fest in combinaciones
    ])

    # Predecir
    df_sim['popularidad_predicha'] = pipeline.predict(df_sim)
    mejor = df_sim.sort_values('popularidad_predicha', ascending=False).iloc[0]
    return mejor

# Ejemplo de uso:
mejor = mejor_combinacion(dia_semana='Saturday', estacion='Otoño', zona='Buenos Aires',aforo = 80000)
print("Mejor combinación para Verano:")
print(mejor[['Zona', 'DíaSemana', 'cantidad_canciones', 'Mes', 'aforo', 'popularidad_predicha']])
```

::: {.output .stream .stdout}
    Mejor combinación para Verano:
    Zona                    Buenos Aires
    DíaSemana                   Saturday
    cantidad_canciones                25
    Mes                                1
    aforo                          80000
    popularidad_predicha        0.456042
    Name: 0, dtype: object
:::
::::

:::: {#e1d16ed5 .cell .code execution_count="141"}
``` python
import pandas as pd
from collections import Counter

# 1. Filtrá shows populares
umbral_top = df_conciertos_sin_ineditos['indice_popularidad_norm'].quantile(0.1)
top_shows = df_conciertos_sin_ineditos[df_conciertos_sin_ineditos['indice_popularidad_norm'] >= umbral_top]

# 2. Expandí a una tabla con canción y posición
records = []
for canciones in top_shows['canciones_show'].dropna():
    for pos, cancion in enumerate(canciones, 1):
        records.append({'cancion': cancion, 'posicion': pos})

df_posiciones = pd.DataFrame(records)
df_posiciones
```

::: {.output .execute_result execution_count="141"}
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
      <th>cancion</th>
      <th>posicion</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>Ximenita</td>
      <td>1</td>
    </tr>
    <tr>
      <th>1</th>
      <td>Taxi Boy</td>
      <td>2</td>
    </tr>
    <tr>
      <th>2</th>
      <td>Babilonia</td>
      <td>3</td>
    </tr>
    <tr>
      <th>3</th>
      <td>Ay ay ay</td>
      <td>4</td>
    </tr>
    <tr>
      <th>4</th>
      <td>Gris</td>
      <td>5</td>
    </tr>
    <tr>
      <th>...</th>
      <td>...</td>
      <td>...</td>
    </tr>
    <tr>
      <th>3180</th>
      <td>El farolito</td>
      <td>29</td>
    </tr>
    <tr>
      <th>3181</th>
      <td>El balneario de los doctores crotos</td>
      <td>30</td>
    </tr>
    <tr>
      <th>3182</th>
      <td>Cruel</td>
      <td>31</td>
    </tr>
    <tr>
      <th>3183</th>
      <td>Finale</td>
      <td>32</td>
    </tr>
    <tr>
      <th>3184</th>
      <td>Himno Nacional Argentino</td>
      <td>33</td>
    </tr>
  </tbody>
</table>
<p>3185 rows × 2 columns</p>
</div>
:::
::::

:::: {#97e7029b .cell .code execution_count="144"}
``` python
# 3. Calculá frecuencia y posición promedio
conteo = df_posiciones['cancion'].value_counts()
pos_prom = df_posiciones.groupby('cancion')['posicion'].mean()
conteo.head(30)
```

::: {.output .execute_result execution_count="144"}
    cancion
    El farolito                            96
    Tan solo                               94
    Fijate                                 90
    Maradó                                 87
    Finale                                 84
    Desde lejos no se ve                   83
    Taxi Boy                               83
    Ruleta                                 81
    El balneario de los doctores crotos    79
    Intro Maradó                           78
    Pistolas                               76
    Muévelo                                75
    Luz de marfil                          73
    Genius                                 69
    Todo pasa                              69
    Cruel                                  68
    Ay ay ay                               67
    Fantasma                               59
    Babilonia                              57
    Te diría                               57
    Labios de seda                         54
    Vine hasta aquí                        53
    Pacífico                               51
    Chac tu chac                           51
    Bicho de ciudad                        49
    Agua                                   48
    Morella                                45
    Difícil                                43
    María y José                           42
    Civilización                           42
    Name: count, dtype: int64
:::
::::

:::: {#7f06d4ae .cell .code execution_count="153"}
``` python
# 4. Elegí las 18 más frecuentes y ordenalas por posición promedio
top_canciones = conteo.head(30).index
setlist_ideal = pd.DataFrame({
    'cancion': top_canciones,
    'posicion_promedio': pos_prom.loc[top_canciones]
}).sort_values('posicion_promedio')

# 5. Mostralo
import matplotlib.pyplot as plt


setlist_ideal = setlist_ideal.reset_index(drop=True)
setlist_ideal['orden'] = setlist_ideal.index + 1
setlist_ideal[['cancion', 'orden']]
```

::: {.output .execute_result execution_count="153"}
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
      <th>cancion</th>
      <th>orden</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>María y José</td>
      <td>1</td>
    </tr>
    <tr>
      <th>1</th>
      <td>Taxi Boy</td>
      <td>2</td>
    </tr>
    <tr>
      <th>2</th>
      <td>Te diría</td>
      <td>3</td>
    </tr>
    <tr>
      <th>3</th>
      <td>Civilización</td>
      <td>4</td>
    </tr>
    <tr>
      <th>4</th>
      <td>Desde lejos no se ve</td>
      <td>5</td>
    </tr>
    <tr>
      <th>5</th>
      <td>Ay ay ay</td>
      <td>6</td>
    </tr>
    <tr>
      <th>6</th>
      <td>Chac tu chac</td>
      <td>7</td>
    </tr>
    <tr>
      <th>7</th>
      <td>Babilonia</td>
      <td>8</td>
    </tr>
    <tr>
      <th>8</th>
      <td>Labios de seda</td>
      <td>9</td>
    </tr>
    <tr>
      <th>9</th>
      <td>Fantasma</td>
      <td>10</td>
    </tr>
    <tr>
      <th>10</th>
      <td>Tan solo</td>
      <td>11</td>
    </tr>
    <tr>
      <th>11</th>
      <td>Intro Maradó</td>
      <td>12</td>
    </tr>
    <tr>
      <th>12</th>
      <td>Luz de marfil</td>
      <td>13</td>
    </tr>
    <tr>
      <th>13</th>
      <td>Maradó</td>
      <td>14</td>
    </tr>
    <tr>
      <th>14</th>
      <td>Todo pasa</td>
      <td>15</td>
    </tr>
    <tr>
      <th>15</th>
      <td>Fijate</td>
      <td>16</td>
    </tr>
    <tr>
      <th>16</th>
      <td>Pacífico</td>
      <td>17</td>
    </tr>
    <tr>
      <th>17</th>
      <td>Difícil</td>
      <td>18</td>
    </tr>
    <tr>
      <th>18</th>
      <td>Agua</td>
      <td>19</td>
    </tr>
    <tr>
      <th>19</th>
      <td>Bicho de ciudad</td>
      <td>20</td>
    </tr>
    <tr>
      <th>20</th>
      <td>Vine hasta aquí</td>
      <td>21</td>
    </tr>
    <tr>
      <th>21</th>
      <td>Pistolas</td>
      <td>22</td>
    </tr>
    <tr>
      <th>22</th>
      <td>Morella</td>
      <td>23</td>
    </tr>
    <tr>
      <th>23</th>
      <td>Ruleta</td>
      <td>24</td>
    </tr>
    <tr>
      <th>24</th>
      <td>El farolito</td>
      <td>25</td>
    </tr>
    <tr>
      <th>25</th>
      <td>Cruel</td>
      <td>26</td>
    </tr>
    <tr>
      <th>26</th>
      <td>El balneario de los doctores crotos</td>
      <td>27</td>
    </tr>
    <tr>
      <th>27</th>
      <td>Genius</td>
      <td>28</td>
    </tr>
    <tr>
      <th>28</th>
      <td>Muévelo</td>
      <td>29</td>
    </tr>
    <tr>
      <th>29</th>
      <td>Finale</td>
      <td>30</td>
    </tr>
  </tbody>
</table>
</div>
:::
::::

:::: {#17228454 .cell .code execution_count="163"}
``` python
# Definí qué es un "hit" (top 25% más populares)
umbral_hit = df_popularidad['indice_popularidad_norm'].quantile(0.75)
hits = set(df_popularidad[df_popularidad['indice_popularidad_norm'] >= umbral_hit]['cancion_norm'])

def proporcion_hits(canciones):
    if not isinstance(canciones, list) or len(canciones) == 0:
        return 0
    canciones_norm = [normalize(c) for c in canciones]
    return sum(c in hits for c in canciones_norm) / len(canciones_norm)

df_conciertos_sin_ineditos['proporcion_hits'] = df_conciertos_sin_ineditos['canciones_show'].apply(proporcion_hits)

# Agrupá por ciudad (Localidad) y calculá el promedio de hits
hits_por_ciudad = df_conciertos_sin_ineditos.groupby('Localidad')['proporcion_hits'].mean().sort_values(ascending=False)


import matplotlib.pyplot as plt
# Cargar la fuente desde el archivo directamente

import matplotlib.font_manager as fm
fuente_path = r"C:\Users\Yo\AppData\Local\Microsoft\Windows\Fonts\Los_Piojos.ttf"
fuente_prop = fm.FontProperties(fname=fuente_path)

top_n = 12  # Mostrá las 12 ciudades con más shows
ax = hits_por_ciudad.head(top_n).plot(kind='bar', color='crimson')
ax.set_title('Porcentaje promedio de hits tocados por ciudad', fontproperties=fuente_prop)
ax.set_ylabel('Proporción de hits')
ax.set_xlabel('Ciudad')
ax.set_xticklabels(hits_por_ciudad.head(top_n).index, rotation=45, ha='right')
ax.set_ylim(0, 1)
plt.tight_layout()
plt.show()
```

::: {.output .display_data}
![](2157a1fff8903c4ca5cf9849f8e1825b69f00f40.png)
:::
::::

:::: {#8afeb111 .cell .code execution_count="164"}
``` python
# Para cada año, encontrá las canciones que se tocaron por primera vez
cancion_primera_vez = {}

for idx, row in df_conciertos_sin_ineditos.iterrows():
    año = row['Año']
    canciones = row['canciones_show']
    if not isinstance(canciones, list):
        continue
    for c in canciones:
        if c not in cancion_primera_vez:
            cancion_primera_vez[c] = año

# Armá un DataFrame con año y cantidad de "estrenos"
df_estrenos = pd.Series(list(cancion_primera_vez.values())).value_counts().sort_index()
df_estrenos = df_estrenos.rename_axis('Año').reset_index(name='Canciones nuevas')

# Gráfico de barras
plt.figure(figsize=(10,5))
plt.bar(df_estrenos['Año'], df_estrenos['Canciones nuevas'], color='forestgreen')
plt.title('Canciones nuevas incorporadas al setlist por año')
plt.xlabel('Año')
plt.ylabel('Cantidad de estrenos')
plt.tight_layout()
plt.show()
```

::: {.output .display_data}
![](fc949d74dc04e360e1c6f9e9229934d7caa2cc8d.png)
:::
::::

:::: {#76c0ab02 .cell .code execution_count="177"}
``` python
import plotly.express as px
ciudades_coords = {
    'Concordia': (-31.3929, -58.0189),
    'Avellaneda': (-34.6635, -58.3651),
    'Buenos Aires': (-34.6037, -58.3816),
    'La Plata': (-34.9214, -57.9544),
    'Villa Gesell': (-37.2636, -56.9731),
    'Santa Fe': (-31.6333, -60.7000),
    'Córdoba': (-31.4201, -64.1888),
    'Mar del Plata': (-38.0055, -57.5426),
    'Cosquín': (-31.2483, -64.4564),
    'Galvez': (-32.0281, -61.2208),
    'San Juan': (-31.5375, -68.5364),
    'Mendoza': (-32.8895, -68.8458),
    'La Rioja': (-29.4131, -66.8558),
    'Chascomús': (-35.5725, -58.0092),
    'San Salvador de Jujuy': (-24.1858, -65.2995),
    'Bariloche': (-41.1335, -71.3103),
    'Sauce Viejo': (-31.8167, -60.8333),
    'Paysandú': (-32.3214, -58.0756),
    'San Miguel de Tucumán': (-26.8083, -65.2176),
    'Comodoro Rivadavia': (-45.8647, -67.4822),
    'Bahía Blanca': (-38.7196, -62.2724),
    'Rosario': (-32.9468, -60.6393),
    'Palma de Mallorca': (39.5696, 2.6502),
    'Río Grande': (-53.7877, -67.7095),
    'Salta': (-24.7821, -65.4232),
    'Rodeo del Medio': (-32.9833, -68.6833),
    'Villa María': (-32.4075, -63.2406),
    'Río Gallegos': (-51.6230, -69.2168),
    'Trelew': (-43.2489, -65.3051),
    'Olavarría': (-36.8927, -60.3225),
    'Neuquén': (-38.9516, -68.0591),
    'Barcelona': (41.3851, 2.1734),
    'Milan': (45.4642, 9.1900),
    'Corrientes': (-27.4692, -58.8306),
    'Caleta Olivia': (-46.4444, -67.5281),
    'Santa Maria de Punilla': (-31.2776, -64.4927),
    'Villa Martelli': (-34.5456, -58.5236)
}
# Armá el DataFrame para el mapa
df_map = hits_por_ciudad.reset_index().rename(columns={'Localidad': 'Ciudad'})
df_map['lat'] = df_map['Ciudad'].map(lambda x: ciudades_coords.get(x.strip(), (None, None))[0])
df_map['lon'] = df_map['Ciudad'].map(lambda x: ciudades_coords.get(x.strip(), (None, None))[1])
df_map = df_map.dropna(subset=['lat', 'lon'])

fig = px.scatter_mapbox(
    df_map,
    lat="lat",
    lon="lon",
    size="proporcion_hits",
    color="proporcion_hits",
    color_continuous_scale=px.colors.sequential.OrRd,
    size_max=30,
    zoom=3,
    hover_name="Ciudad",
    hover_data={"proporcion_hits":":.2f",
                "lat": False, "lon": False
                },
    title="Porcentaje promedio de hits tocados por ciudad"
)
fig.update_layout(mapbox_style="carto-positron")
fig.update_layout(margin={"r":0,"t":40,"l":0,"b":0})
fig.show()
```

::: {.output .display_data}
``` json
{"config":{"plotlyServerURL":"https://plot.ly"},"data":[{"customdata":[[0.85,-27.4692,-58.8306],[0.85,-46.4444,-67.5281],[0.8260869565217391,41.3851,2.1734],[0.7878787878787878,-38.9516,-68.0591],[0.782608695652174,-43.2489,-65.3051],[0.782608695652174,-51.623,-69.2168],[0.7826086956521738,39.5696,2.6502],[0.7519632414369256,-24.1858,-65.2995],[0.7444444444444445,-31.5375,-68.5364],[0.7368421052631579,45.4642,9.19],[0.7142857142857143,-32.9833,-68.6833],[0.6918181818181819,-26.8083,-65.2176],[0.6863636363636363,-38.7196,-62.2724],[0.6842105263157895,-32.3214,-58.0756],[0.6666666666666666,-31.2776,-64.4927],[0.6666666666666666,-24.7821,-65.4232],[0.6666666666666666,-53.7877,-67.7095],[0.6659334023464458,-45.8647,-67.4822],[0.6521739130434783,-29.4131,-66.8558],[0.6363636363636364,-32.4075,-63.2406],[0.6333081330907419,-32.9468,-60.6393],[0.6,-31.8167,-60.8333],[0.6,-41.1335,-71.3103],[0.5900482017055988,-32.8895,-68.8458],[0.5806451612903226,-36.8927,-60.3225],[0.5784334023464458,-31.2483,-64.4564],[0.5773566072749814,-31.4201,-64.1888],[0.5769230769230769,-35.5725,-58.0092],[0.5714285714285714,-34.5456,-58.5236],[0.5600373442664632,-38.0055,-57.5426],[0.56,-32.0281,-61.2208],[0.5397590102775351,-34.9214,-57.9544],[0.492528801022734,-34.6037,-58.3816],[0.45726495726495725,-31.6333,-60.7],[0.447463768115942,-34.6635,-58.3651],[0.42857142857142855,-37.2636,-56.9731],[0.4230769230769231,-31.3929,-58.0189]],"hovertemplate":"<b>%{hovertext}</b><br><br>proporcion_hits=%{marker.color:.2f}<extra></extra>","hovertext":[" Corrientes"," Caleta Olivia"," Barcelona"," Neuquén"," Trelew"," Río Gallegos"," Palma de Mallorca"," San Salvador de Jujuy"," San Juan"," Milan"," Rodeo del Medio"," San Miguel de Tucumán"," Bahía Blanca"," Paysandú"," Santa Maria de Punilla"," Salta"," Río Grande"," Comodoro Rivadavia"," La Rioja"," Villa María"," Rosario"," Sauce Viejo"," Bariloche"," Mendoza"," Olavarría"," Cosquín"," Córdoba"," Chascomús"," Villa Martelli"," Mar del Plata"," Galvez"," La Plata"," Buenos Aires"," Santa Fe"," Avellaneda"," Villa Gesell"," Concordia"],"lat":[-27.4692,-46.4444,41.3851,-38.9516,-43.2489,-51.623,39.5696,-24.1858,-31.5375,45.4642,-32.9833,-26.8083,-38.7196,-32.3214,-31.2776,-24.7821,-53.7877,-45.8647,-29.4131,-32.4075,-32.9468,-31.8167,-41.1335,-32.8895,-36.8927,-31.2483,-31.4201,-35.5725,-34.5456,-38.0055,-32.0281,-34.9214,-34.6037,-31.6333,-34.6635,-37.2636,-31.3929],"legendgroup":"","lon":[-58.8306,-67.5281,2.1734,-68.0591,-65.3051,-69.2168,2.6502,-65.2995,-68.5364,9.19,-68.6833,-65.2176,-62.2724,-58.0756,-64.4927,-65.4232,-67.7095,-67.4822,-66.8558,-63.2406,-60.6393,-60.8333,-71.3103,-68.8458,-60.3225,-64.4564,-64.1888,-58.0092,-58.5236,-57.5426,-61.2208,-57.9544,-58.3816,-60.7,-58.3651,-56.9731,-58.0189],"marker":{"color":[0.85,0.85,0.8260869565217391,0.7878787878787878,0.782608695652174,0.782608695652174,0.7826086956521738,0.7519632414369256,0.7444444444444445,0.7368421052631579,0.7142857142857143,0.6918181818181819,0.6863636363636363,0.6842105263157895,0.6666666666666666,0.6666666666666666,0.6666666666666666,0.6659334023464458,0.6521739130434783,0.6363636363636364,0.6333081330907419,0.6,0.6,0.5900482017055988,0.5806451612903226,0.5784334023464458,0.5773566072749814,0.5769230769230769,0.5714285714285714,0.5600373442664632,0.56,0.5397590102775351,0.492528801022734,0.45726495726495725,0.447463768115942,0.42857142857142855,0.4230769230769231],"coloraxis":"coloraxis","size":[0.85,0.85,0.8260869565217391,0.7878787878787878,0.782608695652174,0.782608695652174,0.7826086956521738,0.7519632414369256,0.7444444444444445,0.7368421052631579,0.7142857142857143,0.6918181818181819,0.6863636363636363,0.6842105263157895,0.6666666666666666,0.6666666666666666,0.6666666666666666,0.6659334023464458,0.6521739130434783,0.6363636363636364,0.6333081330907419,0.6,0.6,0.5900482017055988,0.5806451612903226,0.5784334023464458,0.5773566072749814,0.5769230769230769,0.5714285714285714,0.5600373442664632,0.56,0.5397590102775351,0.492528801022734,0.45726495726495725,0.447463768115942,0.42857142857142855,0.4230769230769231],"sizemode":"area","sizeref":9.444444444444444e-4},"mode":"markers","name":"","showlegend":false,"subplot":"mapbox","type":"scattermapbox"}],"layout":{"coloraxis":{"colorbar":{"title":{"text":"proporcion_hits"}},"colorscale":[[0,"rgb(255,247,236)"],[0.125,"rgb(254,232,200)"],[0.25,"rgb(253,212,158)"],[0.375,"rgb(253,187,132)"],[0.5,"rgb(252,141,89)"],[0.625,"rgb(239,101,72)"],[0.75,"rgb(215,48,31)"],[0.875,"rgb(179,0,0)"],[1,"rgb(127,0,0)"]]},"legend":{"itemsizing":"constant","tracegroupgap":0},"mapbox":{"center":{"lat":-28.875256756756755,"lon":-57.68920540540542},"domain":{"x":[0,1],"y":[0,1]},"style":"carto-positron","zoom":3},"margin":{"b":0,"l":0,"r":0,"t":40},"template":{"data":{"bar":[{"error_x":{"color":"#2a3f5f"},"error_y":{"color":"#2a3f5f"},"marker":{"line":{"color":"#E5ECF6","width":0.5},"pattern":{"fillmode":"overlay","size":10,"solidity":0.2}},"type":"bar"}],"barpolar":[{"marker":{"line":{"color":"#E5ECF6","width":0.5},"pattern":{"fillmode":"overlay","size":10,"solidity":0.2}},"type":"barpolar"}],"carpet":[{"aaxis":{"endlinecolor":"#2a3f5f","gridcolor":"white","linecolor":"white","minorgridcolor":"white","startlinecolor":"#2a3f5f"},"baxis":{"endlinecolor":"#2a3f5f","gridcolor":"white","linecolor":"white","minorgridcolor":"white","startlinecolor":"#2a3f5f"},"type":"carpet"}],"choropleth":[{"colorbar":{"outlinewidth":0,"ticks":""},"type":"choropleth"}],"contour":[{"colorbar":{"outlinewidth":0,"ticks":""},"colorscale":[[0,"#0d0887"],[0.1111111111111111,"#46039f"],[0.2222222222222222,"#7201a8"],[0.3333333333333333,"#9c179e"],[0.4444444444444444,"#bd3786"],[0.5555555555555556,"#d8576b"],[0.6666666666666666,"#ed7953"],[0.7777777777777778,"#fb9f3a"],[0.8888888888888888,"#fdca26"],[1,"#f0f921"]],"type":"contour"}],"contourcarpet":[{"colorbar":{"outlinewidth":0,"ticks":""},"type":"contourcarpet"}],"heatmap":[{"colorbar":{"outlinewidth":0,"ticks":""},"colorscale":[[0,"#0d0887"],[0.1111111111111111,"#46039f"],[0.2222222222222222,"#7201a8"],[0.3333333333333333,"#9c179e"],[0.4444444444444444,"#bd3786"],[0.5555555555555556,"#d8576b"],[0.6666666666666666,"#ed7953"],[0.7777777777777778,"#fb9f3a"],[0.8888888888888888,"#fdca26"],[1,"#f0f921"]],"type":"heatmap"}],"heatmapgl":[{"colorbar":{"outlinewidth":0,"ticks":""},"colorscale":[[0,"#0d0887"],[0.1111111111111111,"#46039f"],[0.2222222222222222,"#7201a8"],[0.3333333333333333,"#9c179e"],[0.4444444444444444,"#bd3786"],[0.5555555555555556,"#d8576b"],[0.6666666666666666,"#ed7953"],[0.7777777777777778,"#fb9f3a"],[0.8888888888888888,"#fdca26"],[1,"#f0f921"]],"type":"heatmapgl"}],"histogram":[{"marker":{"pattern":{"fillmode":"overlay","size":10,"solidity":0.2}},"type":"histogram"}],"histogram2d":[{"colorbar":{"outlinewidth":0,"ticks":""},"colorscale":[[0,"#0d0887"],[0.1111111111111111,"#46039f"],[0.2222222222222222,"#7201a8"],[0.3333333333333333,"#9c179e"],[0.4444444444444444,"#bd3786"],[0.5555555555555556,"#d8576b"],[0.6666666666666666,"#ed7953"],[0.7777777777777778,"#fb9f3a"],[0.8888888888888888,"#fdca26"],[1,"#f0f921"]],"type":"histogram2d"}],"histogram2dcontour":[{"colorbar":{"outlinewidth":0,"ticks":""},"colorscale":[[0,"#0d0887"],[0.1111111111111111,"#46039f"],[0.2222222222222222,"#7201a8"],[0.3333333333333333,"#9c179e"],[0.4444444444444444,"#bd3786"],[0.5555555555555556,"#d8576b"],[0.6666666666666666,"#ed7953"],[0.7777777777777778,"#fb9f3a"],[0.8888888888888888,"#fdca26"],[1,"#f0f921"]],"type":"histogram2dcontour"}],"mesh3d":[{"colorbar":{"outlinewidth":0,"ticks":""},"type":"mesh3d"}],"parcoords":[{"line":{"colorbar":{"outlinewidth":0,"ticks":""}},"type":"parcoords"}],"pie":[{"automargin":true,"type":"pie"}],"scatter":[{"fillpattern":{"fillmode":"overlay","size":10,"solidity":0.2},"type":"scatter"}],"scatter3d":[{"line":{"colorbar":{"outlinewidth":0,"ticks":""}},"marker":{"colorbar":{"outlinewidth":0,"ticks":""}},"type":"scatter3d"}],"scattercarpet":[{"marker":{"colorbar":{"outlinewidth":0,"ticks":""}},"type":"scattercarpet"}],"scattergeo":[{"marker":{"colorbar":{"outlinewidth":0,"ticks":""}},"type":"scattergeo"}],"scattergl":[{"marker":{"colorbar":{"outlinewidth":0,"ticks":""}},"type":"scattergl"}],"scattermapbox":[{"marker":{"colorbar":{"outlinewidth":0,"ticks":""}},"type":"scattermapbox"}],"scatterpolar":[{"marker":{"colorbar":{"outlinewidth":0,"ticks":""}},"type":"scatterpolar"}],"scatterpolargl":[{"marker":{"colorbar":{"outlinewidth":0,"ticks":""}},"type":"scatterpolargl"}],"scatterternary":[{"marker":{"colorbar":{"outlinewidth":0,"ticks":""}},"type":"scatterternary"}],"surface":[{"colorbar":{"outlinewidth":0,"ticks":""},"colorscale":[[0,"#0d0887"],[0.1111111111111111,"#46039f"],[0.2222222222222222,"#7201a8"],[0.3333333333333333,"#9c179e"],[0.4444444444444444,"#bd3786"],[0.5555555555555556,"#d8576b"],[0.6666666666666666,"#ed7953"],[0.7777777777777778,"#fb9f3a"],[0.8888888888888888,"#fdca26"],[1,"#f0f921"]],"type":"surface"}],"table":[{"cells":{"fill":{"color":"#EBF0F8"},"line":{"color":"white"}},"header":{"fill":{"color":"#C8D4E3"},"line":{"color":"white"}},"type":"table"}]},"layout":{"annotationdefaults":{"arrowcolor":"#2a3f5f","arrowhead":0,"arrowwidth":1},"autotypenumbers":"strict","coloraxis":{"colorbar":{"outlinewidth":0,"ticks":""}},"colorscale":{"diverging":[[0,"#8e0152"],[0.1,"#c51b7d"],[0.2,"#de77ae"],[0.3,"#f1b6da"],[0.4,"#fde0ef"],[0.5,"#f7f7f7"],[0.6,"#e6f5d0"],[0.7,"#b8e186"],[0.8,"#7fbc41"],[0.9,"#4d9221"],[1,"#276419"]],"sequential":[[0,"#0d0887"],[0.1111111111111111,"#46039f"],[0.2222222222222222,"#7201a8"],[0.3333333333333333,"#9c179e"],[0.4444444444444444,"#bd3786"],[0.5555555555555556,"#d8576b"],[0.6666666666666666,"#ed7953"],[0.7777777777777778,"#fb9f3a"],[0.8888888888888888,"#fdca26"],[1,"#f0f921"]],"sequentialminus":[[0,"#0d0887"],[0.1111111111111111,"#46039f"],[0.2222222222222222,"#7201a8"],[0.3333333333333333,"#9c179e"],[0.4444444444444444,"#bd3786"],[0.5555555555555556,"#d8576b"],[0.6666666666666666,"#ed7953"],[0.7777777777777778,"#fb9f3a"],[0.8888888888888888,"#fdca26"],[1,"#f0f921"]]},"colorway":["#636efa","#EF553B","#00cc96","#ab63fa","#FFA15A","#19d3f3","#FF6692","#B6E880","#FF97FF","#FECB52"],"font":{"color":"#2a3f5f"},"geo":{"bgcolor":"white","lakecolor":"white","landcolor":"#E5ECF6","showlakes":true,"showland":true,"subunitcolor":"white"},"hoverlabel":{"align":"left"},"hovermode":"closest","mapbox":{"style":"light"},"paper_bgcolor":"white","plot_bgcolor":"#E5ECF6","polar":{"angularaxis":{"gridcolor":"white","linecolor":"white","ticks":""},"bgcolor":"#E5ECF6","radialaxis":{"gridcolor":"white","linecolor":"white","ticks":""}},"scene":{"xaxis":{"backgroundcolor":"#E5ECF6","gridcolor":"white","gridwidth":2,"linecolor":"white","showbackground":true,"ticks":"","zerolinecolor":"white"},"yaxis":{"backgroundcolor":"#E5ECF6","gridcolor":"white","gridwidth":2,"linecolor":"white","showbackground":true,"ticks":"","zerolinecolor":"white"},"zaxis":{"backgroundcolor":"#E5ECF6","gridcolor":"white","gridwidth":2,"linecolor":"white","showbackground":true,"ticks":"","zerolinecolor":"white"}},"shapedefaults":{"line":{"color":"#2a3f5f"}},"ternary":{"aaxis":{"gridcolor":"white","linecolor":"white","ticks":""},"baxis":{"gridcolor":"white","linecolor":"white","ticks":""},"bgcolor":"#E5ECF6","caxis":{"gridcolor":"white","linecolor":"white","ticks":""}},"title":{"x":5.0e-2},"xaxis":{"automargin":true,"gridcolor":"white","linecolor":"white","ticks":"","title":{"standoff":15},"zerolinecolor":"white","zerolinewidth":2},"yaxis":{"automargin":true,"gridcolor":"white","linecolor":"white","ticks":"","title":{"standoff":15},"zerolinecolor":"white","zerolinewidth":2}}},"title":{"text":"Porcentaje promedio de hits tocados por ciudad"}}}
```
:::
::::

:::: {#80097fda .cell .code execution_count="172"}
``` python
df_conciertos_sin_ineditos['Localidad'].unique()
```

::: {.output .execute_result execution_count="172"}
    array([' Concordia', ' Avellaneda', ' Buenos Aires', ' La Plata',
           ' Villa Gesell', ' Santa Fe', ' Córdoba', ' Mar del Plata',
           ' Cosquín', ' Galvez', ' San Juan', ' Mendoza', ' La Rioja',
           ' Chascomús', ' San Salvador de Jujuy', ' Bariloche',
           ' Sauce Viejo', ' Paysandú', ' San Miguel de Tucumán',
           ' Comodoro Rivadavia', ' Bahía Blanca', ' Rosario',
           ' Palma de Mallorca', ' Río Grande', ' Salta', ' Rodeo del Medio',
           ' Villa María', ' Río Gallegos', ' Trelew', ' Olavarría',
           ' Neuquén', ' Barcelona', ' Milan', ' Corrientes',
           ' Caleta Olivia', ' Santa Maria de Punilla', ' Villa Martelli'],
          dtype=object)
:::
::::

:::: {#e46b8bec .cell .code execution_count="170"}
``` python
import plotly.graph_objects as go

# Armá los nodos (años y canciones nuevas)
estrenos = []
for idx, row in df_conciertos_sin_ineditos.iterrows():
    año = row['Año']
    canciones = row['canciones_show']
    if not isinstance(canciones, list):
        continue
    for c in canciones:
        if c not in cancion_primera_vez:
            cancion_primera_vez[c] = año
            estrenos.append((año, c))

# Nodos: años + canciones
anios = sorted(set(a for a, _ in estrenos))
canciones = [c for _, c in estrenos]
labels = [str(a) for a in anios] + canciones

# Links
source = []
target = []
value = []
for a, c in estrenos:
    source.append(labels.index(str(a)))
    target.append(labels.index(c))
    value.append(1)

fig = go.Figure(data=[go.Sankey(
    node=dict(
        pad=15,
        thickness=15,
        line=dict(color="black", width=0.5),
        label=labels,
        color="green"
    ),
    link=dict(
        source=source,
        target=target,
        value=value
    ))])

fig.update_layout(title_text="Evolución de canciones nuevas por año (Sankey)", font_size=10)
fig.show()
```

::: {.output .display_data}
``` json
{"config":{"plotlyServerURL":"https://plot.ly"},"data":[{"link":{"source":[],"target":[],"value":[]},"node":{"color":"green","label":[],"line":{"color":"black","width":0.5},"pad":15,"thickness":15},"type":"sankey"}],"layout":{"font":{"size":10},"template":{"data":{"bar":[{"error_x":{"color":"#2a3f5f"},"error_y":{"color":"#2a3f5f"},"marker":{"line":{"color":"#E5ECF6","width":0.5},"pattern":{"fillmode":"overlay","size":10,"solidity":0.2}},"type":"bar"}],"barpolar":[{"marker":{"line":{"color":"#E5ECF6","width":0.5},"pattern":{"fillmode":"overlay","size":10,"solidity":0.2}},"type":"barpolar"}],"carpet":[{"aaxis":{"endlinecolor":"#2a3f5f","gridcolor":"white","linecolor":"white","minorgridcolor":"white","startlinecolor":"#2a3f5f"},"baxis":{"endlinecolor":"#2a3f5f","gridcolor":"white","linecolor":"white","minorgridcolor":"white","startlinecolor":"#2a3f5f"},"type":"carpet"}],"choropleth":[{"colorbar":{"outlinewidth":0,"ticks":""},"type":"choropleth"}],"contour":[{"colorbar":{"outlinewidth":0,"ticks":""},"colorscale":[[0,"#0d0887"],[0.1111111111111111,"#46039f"],[0.2222222222222222,"#7201a8"],[0.3333333333333333,"#9c179e"],[0.4444444444444444,"#bd3786"],[0.5555555555555556,"#d8576b"],[0.6666666666666666,"#ed7953"],[0.7777777777777778,"#fb9f3a"],[0.8888888888888888,"#fdca26"],[1,"#f0f921"]],"type":"contour"}],"contourcarpet":[{"colorbar":{"outlinewidth":0,"ticks":""},"type":"contourcarpet"}],"heatmap":[{"colorbar":{"outlinewidth":0,"ticks":""},"colorscale":[[0,"#0d0887"],[0.1111111111111111,"#46039f"],[0.2222222222222222,"#7201a8"],[0.3333333333333333,"#9c179e"],[0.4444444444444444,"#bd3786"],[0.5555555555555556,"#d8576b"],[0.6666666666666666,"#ed7953"],[0.7777777777777778,"#fb9f3a"],[0.8888888888888888,"#fdca26"],[1,"#f0f921"]],"type":"heatmap"}],"heatmapgl":[{"colorbar":{"outlinewidth":0,"ticks":""},"colorscale":[[0,"#0d0887"],[0.1111111111111111,"#46039f"],[0.2222222222222222,"#7201a8"],[0.3333333333333333,"#9c179e"],[0.4444444444444444,"#bd3786"],[0.5555555555555556,"#d8576b"],[0.6666666666666666,"#ed7953"],[0.7777777777777778,"#fb9f3a"],[0.8888888888888888,"#fdca26"],[1,"#f0f921"]],"type":"heatmapgl"}],"histogram":[{"marker":{"pattern":{"fillmode":"overlay","size":10,"solidity":0.2}},"type":"histogram"}],"histogram2d":[{"colorbar":{"outlinewidth":0,"ticks":""},"colorscale":[[0,"#0d0887"],[0.1111111111111111,"#46039f"],[0.2222222222222222,"#7201a8"],[0.3333333333333333,"#9c179e"],[0.4444444444444444,"#bd3786"],[0.5555555555555556,"#d8576b"],[0.6666666666666666,"#ed7953"],[0.7777777777777778,"#fb9f3a"],[0.8888888888888888,"#fdca26"],[1,"#f0f921"]],"type":"histogram2d"}],"histogram2dcontour":[{"colorbar":{"outlinewidth":0,"ticks":""},"colorscale":[[0,"#0d0887"],[0.1111111111111111,"#46039f"],[0.2222222222222222,"#7201a8"],[0.3333333333333333,"#9c179e"],[0.4444444444444444,"#bd3786"],[0.5555555555555556,"#d8576b"],[0.6666666666666666,"#ed7953"],[0.7777777777777778,"#fb9f3a"],[0.8888888888888888,"#fdca26"],[1,"#f0f921"]],"type":"histogram2dcontour"}],"mesh3d":[{"colorbar":{"outlinewidth":0,"ticks":""},"type":"mesh3d"}],"parcoords":[{"line":{"colorbar":{"outlinewidth":0,"ticks":""}},"type":"parcoords"}],"pie":[{"automargin":true,"type":"pie"}],"scatter":[{"fillpattern":{"fillmode":"overlay","size":10,"solidity":0.2},"type":"scatter"}],"scatter3d":[{"line":{"colorbar":{"outlinewidth":0,"ticks":""}},"marker":{"colorbar":{"outlinewidth":0,"ticks":""}},"type":"scatter3d"}],"scattercarpet":[{"marker":{"colorbar":{"outlinewidth":0,"ticks":""}},"type":"scattercarpet"}],"scattergeo":[{"marker":{"colorbar":{"outlinewidth":0,"ticks":""}},"type":"scattergeo"}],"scattergl":[{"marker":{"colorbar":{"outlinewidth":0,"ticks":""}},"type":"scattergl"}],"scattermapbox":[{"marker":{"colorbar":{"outlinewidth":0,"ticks":""}},"type":"scattermapbox"}],"scatterpolar":[{"marker":{"colorbar":{"outlinewidth":0,"ticks":""}},"type":"scatterpolar"}],"scatterpolargl":[{"marker":{"colorbar":{"outlinewidth":0,"ticks":""}},"type":"scatterpolargl"}],"scatterternary":[{"marker":{"colorbar":{"outlinewidth":0,"ticks":""}},"type":"scatterternary"}],"surface":[{"colorbar":{"outlinewidth":0,"ticks":""},"colorscale":[[0,"#0d0887"],[0.1111111111111111,"#46039f"],[0.2222222222222222,"#7201a8"],[0.3333333333333333,"#9c179e"],[0.4444444444444444,"#bd3786"],[0.5555555555555556,"#d8576b"],[0.6666666666666666,"#ed7953"],[0.7777777777777778,"#fb9f3a"],[0.8888888888888888,"#fdca26"],[1,"#f0f921"]],"type":"surface"}],"table":[{"cells":{"fill":{"color":"#EBF0F8"},"line":{"color":"white"}},"header":{"fill":{"color":"#C8D4E3"},"line":{"color":"white"}},"type":"table"}]},"layout":{"annotationdefaults":{"arrowcolor":"#2a3f5f","arrowhead":0,"arrowwidth":1},"autotypenumbers":"strict","coloraxis":{"colorbar":{"outlinewidth":0,"ticks":""}},"colorscale":{"diverging":[[0,"#8e0152"],[0.1,"#c51b7d"],[0.2,"#de77ae"],[0.3,"#f1b6da"],[0.4,"#fde0ef"],[0.5,"#f7f7f7"],[0.6,"#e6f5d0"],[0.7,"#b8e186"],[0.8,"#7fbc41"],[0.9,"#4d9221"],[1,"#276419"]],"sequential":[[0,"#0d0887"],[0.1111111111111111,"#46039f"],[0.2222222222222222,"#7201a8"],[0.3333333333333333,"#9c179e"],[0.4444444444444444,"#bd3786"],[0.5555555555555556,"#d8576b"],[0.6666666666666666,"#ed7953"],[0.7777777777777778,"#fb9f3a"],[0.8888888888888888,"#fdca26"],[1,"#f0f921"]],"sequentialminus":[[0,"#0d0887"],[0.1111111111111111,"#46039f"],[0.2222222222222222,"#7201a8"],[0.3333333333333333,"#9c179e"],[0.4444444444444444,"#bd3786"],[0.5555555555555556,"#d8576b"],[0.6666666666666666,"#ed7953"],[0.7777777777777778,"#fb9f3a"],[0.8888888888888888,"#fdca26"],[1,"#f0f921"]]},"colorway":["#636efa","#EF553B","#00cc96","#ab63fa","#FFA15A","#19d3f3","#FF6692","#B6E880","#FF97FF","#FECB52"],"font":{"color":"#2a3f5f"},"geo":{"bgcolor":"white","lakecolor":"white","landcolor":"#E5ECF6","showlakes":true,"showland":true,"subunitcolor":"white"},"hoverlabel":{"align":"left"},"hovermode":"closest","mapbox":{"style":"light"},"paper_bgcolor":"white","plot_bgcolor":"#E5ECF6","polar":{"angularaxis":{"gridcolor":"white","linecolor":"white","ticks":""},"bgcolor":"#E5ECF6","radialaxis":{"gridcolor":"white","linecolor":"white","ticks":""}},"scene":{"xaxis":{"backgroundcolor":"#E5ECF6","gridcolor":"white","gridwidth":2,"linecolor":"white","showbackground":true,"ticks":"","zerolinecolor":"white"},"yaxis":{"backgroundcolor":"#E5ECF6","gridcolor":"white","gridwidth":2,"linecolor":"white","showbackground":true,"ticks":"","zerolinecolor":"white"},"zaxis":{"backgroundcolor":"#E5ECF6","gridcolor":"white","gridwidth":2,"linecolor":"white","showbackground":true,"ticks":"","zerolinecolor":"white"}},"shapedefaults":{"line":{"color":"#2a3f5f"}},"ternary":{"aaxis":{"gridcolor":"white","linecolor":"white","ticks":""},"baxis":{"gridcolor":"white","linecolor":"white","ticks":""},"bgcolor":"#E5ECF6","caxis":{"gridcolor":"white","linecolor":"white","ticks":""}},"title":{"x":5.0e-2},"xaxis":{"automargin":true,"gridcolor":"white","linecolor":"white","ticks":"","title":{"standoff":15},"zerolinecolor":"white","zerolinewidth":2},"yaxis":{"automargin":true,"gridcolor":"white","linecolor":"white","ticks":"","title":{"standoff":15},"zerolinecolor":"white","zerolinewidth":2}}},"title":{"text":"Evolución de canciones nuevas por año (Sankey)"}}}
```
:::
::::
