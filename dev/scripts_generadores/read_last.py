import json

with open(r'C:\Users\leo\.gemini\antigravity\brain\68330a06-4e5d-4fdf-b606-a01f4c78fccc\.system_generated\logs\transcript.jsonl', 'r', encoding='utf-8') as f:
    for line in f:
        data = json.loads(line)
        if data.get('type') == 'PLANNER_RESPONSE':
            cnt = data.get('content', '')
            if 'Listado General' in cnt or 'Períodos Académicos' in cnt:
                print('=== FOUND ===')
                print(cnt)

