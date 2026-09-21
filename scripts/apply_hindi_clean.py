import os
import sys
import json
from clean_rules import clean_hindi_text

from day1_data import DAY_1
from day2_data import DAY_2
from day3_data import DAY_3
from day4_data import DAY_4
from day5_data import DAY_5
from day6_data import DAY_6
from day7_data import DAY_7
from day8_data import DAY_8

days = [
    (1, DAY_1, "day1_data.py"),
    (2, DAY_2, "day2_data.py"),
    (3, DAY_3, "day3_data.py"),
    (4, DAY_4, "day4_data.py"),
    (5, DAY_5, "day5_data.py"),
    (6, DAY_6, "day6_data.py"),
    (7, DAY_7, "day7_data.py"),
    (8, DAY_8, "day8_data.py"),
]

total_cleaned = 0
scripts_dir = os.path.abspath("scripts")

for day_num, day_list, filename in days:
    cleaned_count = 0
    for q in day_list:
        ans_idx = q["answerIndex"]
        for idx, opt in enumerate(q["options"]):
            old_hi = opt["hi"]
            new_hi = clean_hindi_text(old_hi)
            if new_hi != old_hi:
                opt["hi"] = new_hi
                cleaned_count += 1
                total_cleaned += 1
                is_ans = (idx == ans_idx)
                # print sample
                if cleaned_count <= 3:
                    print(f"[Day {day_num} Q{q['num']}{' ANS' if is_ans else ''}] '{old_hi}' -> '{new_hi}'")

    print(f"Day {day_num} ({filename}): Cleaned {cleaned_count} options.")

    # Write back Python file
    filepath = os.path.join(scripts_dir, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(f"# Day {day_num} Data: 50 Questions with 4 Researched SSC Options, Hints & Explanations\n\n")
        f.write(f"DAY_{day_num} = ")
        json.dump(day_list, f, ensure_ascii=False, indent=4)
        f.write("\n")

print(f"\nSUCCESS: Cleaned a total of {total_cleaned} Hindi options across all 8 days!")
