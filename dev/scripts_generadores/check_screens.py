import json

with open('scratch/screens_dump.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for s in data:
    missing = []
    if not s['perfil']: missing.append('perfil')
    if not s['ruta']: missing.append('ruta')
    if not s['proposito']: missing.append('proposito')
    if not s['componentes']: missing.append('componentes')
    if not s['actions']: missing.append('actions')
    print(str(s['index']) + ": " + s['title'] + " | Missing: " + str(missing) + " | Caption: " + s['caption'])

