import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('questions_data.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

count = 0
for q in questions:
    for idx, opt in enumerate(q['options']):
        hi = opt['hi']
        if re.search(r'[A-Za-z]', hi):
            has_paren = bool(re.search(r'\([A-Za-z0-9\s/.,\'-]+\)', hi))
            if not has_paren:
                count += 1
                is_ans = (idx == q['answerIndex'])
                print(f"[{q['id']} opt {idx}{' ANS' if is_ans else ''}]: {hi}")

print(f"\nTotal non-parentheses English in Hindi options: {count}")
