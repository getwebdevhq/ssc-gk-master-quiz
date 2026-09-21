import json
import re

with open('questions_data.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

def clean_hindi_option(text, is_all_english=False):
    original = text
    
    # Pattern: Hindi Text (English text / translation)
    # e.g. "जर्मन सिल्वर (German Silver)" -> "जर्मन सिल्वर"
    # "बैंगनी (Violet)" -> "बैंगनी"
    # "अमेरिका (USA)" -> "अमेरिका"
    # "एम. जी. रानाडे (M. G. Ranade)" -> "एम. जी. रानाडे"
    # "ब्रह्म (Brahm / Brahman)" -> "ब्रह्म"
    # Match: ( [A-Za-z /.-]+ )
    cleaned = re.sub(r'\s*\([A-Za-z0-9\s/.,\'-]+\)', '', text).strip()
    
    # If stripping removed everything (e.g. option was just "(A)"), revert
    if not cleaned:
        cleaned = original
        
    return cleaned

changes = []

for q in questions:
    hi_opts = [opt['hi'] for opt in q['options']]
    ans_idx = q['answerIndex']
    has_english = [bool(re.search(r'[A-Za-z]', opt)) for opt in hi_opts]
    
    # If only one or two options have English in parens, or if it's the giveaway pattern:
    # Check each option
    for idx, opt in enumerate(hi_opts):
        # Look for parentheses with english
        m = re.search(r'\s*\([A-Za-z\s/.,\'-]+\)', opt)
        if m:
            new_opt = clean_hindi_option(opt)
            if new_opt != opt:
                changes.append({
                    "id": q["id"],
                    "day": q["day"],
                    "qNum": q["qNum"],
                    "idx": idx,
                    "is_answer": (idx == ans_idx),
                    "old": opt,
                    "new": new_opt
                })

print(f"Total options with English in parentheses to clean: {len(changes)}")
correct_ans_changes = [c for c in changes if c["is_answer"]]
print(f"Of which were on the CORRECT answer: {len(correct_ans_changes)}")

with open("scripts/cleaned_changes_preview.json", "w", encoding="utf-8") as f:
    json.dump(changes, f, ensure_ascii=False, indent=2)
