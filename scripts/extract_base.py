import re
import json

with open(r'C:\Users\abhib\.gemini\antigravity-ide\brain\3207bcb7-b3cd-475a-bcd4-71b87c724a21\.system_generated\steps\7\content.md', 'r', encoding='utf-8') as f:
    h_raw = f.read()

with open(r'C:\Users\abhib\.gemini\antigravity-ide\brain\3207bcb7-b3cd-475a-bcd4-71b87c724a21\.system_generated\steps\9\content.md', 'r', encoding='utf-8') as f:
    e_raw = f.read()

# English Day positions
pos_e = []
for d in range(1, 9):
    if d == 1:
        m = re.search(r'Day 1:\s*50 GK/GS', e_raw)
        pos_e.append((1, m.start()))
    else:
        m = re.search(rf'User prompt:\s*Day\s*{d}\b', e_raw, re.IGNORECASE)
        if not m:
            m = re.search(rf'Day\s*{d}\b', e_raw, re.IGNORECASE)
        pos_e.append((d, m.start()))

# Hindi Day positions
pos_h = []
for d in range(1, 9):
    pattern = rf'(?:^|\n)\s*Day\s*{d}\b'
    matches = list(re.finditer(pattern, h_raw))
    pos_h.append((d, matches[-1].start()))

pattern_e = r'(\d+)\.\s*Question:(.*?)(?=Answer:)(?:Answer:\s*)(.*?)(?=(?:\d+\.\s*Question:|\n\n\s*Are you ready|\n\n\s*Excellent progress|User prompt:|\Z))'
pattern_h = r'(\d+)\.\s*प्रश्न:(.*?)(?=उत्तर:)(?:उत्तर:\s*)(.*?)(?=(?:\d+\.\s*प्रश्न:|\n\s*Day\s*\d+|\Z))'

all_questions = []

for d in range(1, 9):
    start_e = pos_e[d-1][1]
    end_e = pos_e[d][1] if d < 8 else len(e_raw)
    chunk_e = e_raw[start_e:end_e]
    qs_e = list(re.finditer(pattern_e, chunk_e, re.DOTALL))
    
    start_h = pos_h[d-1][1]
    end_h = pos_h[d][1] if d < 8 else len(h_raw)
    chunk_h = h_raw[start_h:end_h]
    qs_h = list(re.finditer(pattern_h, chunk_h, re.DOTALL))
    
    assert len(qs_e) == 50, f"Day {d} EN has {len(qs_e)} questions"
    assert len(qs_h) == 50, f"Day {d} HI has {len(qs_h)} questions"
    
    for i in range(50):
        m_e = qs_e[i]
        m_h = qs_h[i]
        
        q_en = m_e.group(2).strip()
        ans_part_e = m_e.group(3).strip()
        exam_tag = ""
        if "Exam:" in ans_part_e:
            ans_en, exam_tag = ans_part_e.split("Exam:", 1)
            ans_en = ans_en.strip()
            exam_tag = exam_tag.strip()
        else:
            ans_en = ans_part_e
            
        q_hi = m_h.group(2).strip()
        ans_hi = m_h.group(3).strip()
        # clean trailing notes/lines
        ans_hi = re.sub(r'[_—\n]+$', '', ans_hi).strip()
        
        # Clean answer trailing punctuation
        ans_en = re.sub(r'[\.\s]+$', '', ans_en)
        ans_hi = re.sub(r'[।\.\s]+$', '', ans_hi)
        
        item = {
            "id": (d - 1) * 50 + (i + 1),
            "day": d,
            "dayQuestionNum": i + 1,
            "q_en": q_en,
            "ans_en": ans_en,
            "q_hi": q_hi,
            "ans_hi": ans_hi,
            "exam": exam_tag
        }
        all_questions.append(item)

print(f"Extracted all {len(all_questions)} base questions.")
with open(r'C:\Users\abhib\Documents\GK\scripts\base_questions.json', 'w', encoding='utf-8') as f:
    json.dump(all_questions, f, ensure_ascii=False, indent=2)
print("Saved base_questions.json successfully!")
