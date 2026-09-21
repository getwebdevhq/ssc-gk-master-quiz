import json
import re

with open('questions_data.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

# Find cases where ONLY the correct answer has English or where parentheses contain English
only_correct_has_eng = []
any_has_eng = []

for q in questions:
    hi_opts = [opt['hi'] for opt in q['options']]
    ans_idx = q['answerIndex']
    has_english = [bool(re.search(r'[A-Za-z]', opt)) for opt in hi_opts]
    
    # Check if only the correct option has English
    if has_english[ans_idx] and sum(has_english) == 1:
        only_correct_has_eng.append({
            "id": q["id"],
            "day": q["day"],
            "qNum": q["qNum"],
            "category": q["category"],
            "ans_idx": ans_idx,
            "options": hi_opts
        })
    elif any(has_english):
        any_has_eng.append({
            "id": q["id"],
            "day": q["day"],
            "qNum": q["qNum"],
            "ans_idx": ans_idx,
            "has_english": has_english,
            "options": hi_opts
        })

print(f"Total questions where ONLY the correct option has English: {len(only_correct_has_eng)}")
print(f"Total questions where ANY option has English: {len(any_has_eng) + len(only_correct_has_eng)}")

with open("scripts/audit_only_correct.json", "w", encoding="utf-8") as f:
    json.dump(only_correct_has_eng, f, ensure_ascii=False, indent=2)

with open("scripts/audit_any_eng.json", "w", encoding="utf-8") as f:
    json.dump(any_has_eng, f, ensure_ascii=False, indent=2)

print("Saved audit reports to scripts/audit_only_correct.json and audit_any_eng.json")
