import os
import json
import sys

from day1_data import DAY_1
from day2_data import DAY_2
from day3_data import DAY_3
from day4_data import DAY_4
from day5_data import DAY_5
from day6_data import DAY_6
from day7_data import DAY_7
from day8_data import DAY_8

days_data = [
    (1, DAY_1),
    (2, DAY_2),
    (3, DAY_3),
    (4, DAY_4),
    (5, DAY_5),
    (6, DAY_6),
    (7, DAY_7),
    (8, DAY_8),
]

all_questions = []
errors = []

for day_num, q_list in days_data:
    if len(q_list) != 50:
        errors.append(f"Day {day_num} has {len(q_list)} questions, expected 50.")
    for idx, item in enumerate(q_list, 1):
        q_id = f"d{day_num}_q{idx}"
        
        q_text = item.get("q") or item.get("question")
        if not q_text or not isinstance(q_text, dict):
            errors.append(f"[{q_id}] missing or invalid question dict")
        elif not q_text.get("en") or not q_text.get("hi"):
            errors.append(f"[{q_id}] empty question text in en or hi")
            
        opts = item.get("options")
        if not isinstance(opts, list) or len(opts) != 4:
            errors.append(f"[{q_id}] options must be a list of 4 items")
        else:
            for opt_idx, opt in enumerate(opts):
                if not isinstance(opt, dict) or not opt.get("en") or not opt.get("hi"):
                    errors.append(f"[{q_id}] option {opt_idx} missing en or hi text")
                    
        ans = item.get("answerIndex")
        if not isinstance(ans, int) or ans < 0 or ans > 3:
            errors.append(f"[{q_id}] invalid answerIndex: {ans}")
            
        hint = item.get("hint")
        if not hint or not isinstance(hint, dict) or not hint.get("en") or not hint.get("hi"):
            errors.append(f"[{q_id}] missing or invalid hint en/hi")
            
        exp = item.get("explanation")
        if not exp or not isinstance(exp, dict) or not exp.get("en") or not exp.get("hi"):
            errors.append(f"[{q_id}] missing or invalid explanation en/hi")

        cat = item.get("category", "General Knowledge")
        
        # Standardized question object
        standardized_q = {
            "id": q_id,
            "day": day_num,
            "qNum": idx,
            "category": cat,
            "question": q_text,
            "q": q_text,
            "options": opts,
            "answerIndex": ans,
            "hint": hint,
            "explanation": exp
        }
        all_questions.append(standardized_q)

if errors:
    print(f"Validation FAILED with {len(errors)} error(s):")
    for err in errors[:20]:
        print(" -", err)
    if len(errors) > 20:
        print(f" ... and {len(errors) - 20} more errors.")
    sys.exit(1)

print(f"Validation SUCCESS! Total questions validated: {len(all_questions)}")
for day_num in range(1, 9):
    cnt = len([q for q in all_questions if q["day"] == day_num])
    print(f" - Day {day_num}: {cnt} questions")

# Root path
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
json_out = os.path.join(root_dir, "questions_data.json")
js_out = os.path.join(root_dir, "questions_data.js")

with open(json_out, "w", encoding="utf-8") as f:
    json.dump(all_questions, f, ensure_ascii=False, indent=2)
print(f"Wrote JSON dataset to {json_out} ({os.path.getsize(json_out)} bytes)")

with open(js_out, "w", encoding="utf-8") as f:
    f.write("/**\n * SSC GK/GS 400 MCQ Dataset (Day 1 - Day 8, Bilingual English & Hindi)\n * Automatically compiled by build_all.py\n */\n")
    f.write("const QUIZ_DATA = ")
    json.dump(all_questions, f, ensure_ascii=False, indent=2)
    f.write(";\n\nif (typeof window !== 'undefined') {\n  window.QUIZ_DATA = QUIZ_DATA;\n}\nif (typeof module !== 'undefined' && module.exports) {\n  module.exports = QUIZ_DATA;\n}\n")
print(f"Wrote JS dataset to {js_out} ({os.path.getsize(js_out)} bytes)")
