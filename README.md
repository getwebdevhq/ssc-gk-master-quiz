# 🎯 SSC GK/GS Master Quiz (Day 1 - Day 8)

> **400 High-Yield Bilingual MCQs (English & हिंदी) with Detailed Facts, Hints, and Exam Analytics**

A responsive, high-performance web quiz application designed specifically for SSC aspirants (CGL, CHSL, MTS, CPO, GD). Faithful to modern mobile quiz interfaces, featuring curved headers, circular countdown timers, dynamic audio effects, and seamless bilingual switching.

---

## 🚀 Live Demo & Cloudflare Pages Hosting

This repository is pre-configured for instant zero-config deployment on **Cloudflare Pages**.

### 1-Click Cloudflare Pages Setup:
1. Log into your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigate to **Workers & Pages** > **Create application** > **Pages** tab.
3. Click **Connect to Git** and select this repository: `ssc-gk-master-quiz`.
4. Configure Build settings:
   - **Framework preset:** None / Static
   - **Build command:** *(leave empty)*
   - **Build output directory:** `.` (root directory)
5. Click **Save and Deploy**!
6. Your application will be live globally on a free `*.pages.dev` subdomain with Cloudflare's ultra-fast edge CDN.

---

## ✨ Features

- **400 Researched SSC Questions (Day 1 to Day 8):**
  - Exactly 50 questions per day across 8 comprehensive modules.
  - 4 carefully researched options (1 correct answer + 3 realistic distractors).
  - Detailed SSC exam facts & analysis explaining *why* the answer is correct.
  - Clue/Hint for every question.
- **100% Bilingual (English & हिंदी):**
  - Instant one-click language toggle (`EN` / `हिंदी`).
  - Seamlessly re-renders without losing current selection or progress.
- **Practice & Exam Modes:**
  - **Practice Mode:** Instant feedback (green checkmark / red cross), audio feedback, and expanding explanation drawer.
  - **Exam Mode:** Mock exam environment with Question Palette and comprehensive final scorecard (+2 / -0.5 SSC marking scheme, accuracy %, and mistake review).
- **Interactive Circular Timer:**
  - Floating 20-second SVG circular countdown timer matching mobile mockup design.
- **Synthesized Web Audio:**
  - Pleasant chime for correct answers, soft buzz for wrong answers, and tactile clicks with mute toggle (no external audio assets required).
- **Instant Search (🔍):**
  - Full-text search across all 400 questions in both English and Hindi.
- **Question Palette (1 - 50 Grid):**
  - Color-coded grid for quick jumping between questions.
- **Bookmarks (★):**
  - Save challenging questions to revise later; persisted in `localStorage`.

---

## 🛠️ Local Development

Clone the repository:
```bash
git clone https://github.com/getwebdevhq/ssc-gk-master-quiz.git
cd ssc-gk-master-quiz
```

Run locally:
```bash
# Using Python
python -m http.server 8080

# Or using Node
npx serve .
```

Open `http://localhost:8080` in your web browser.

---

## 📂 Project Structure

```
├── index.html            # Main semantic markup & layout
├── style.css             # Vanilla CSS design system & animations
├── app.js                # Core quiz state machine & audio engine
├── questions_data.js     # Pre-compiled zero-CORS JavaScript data
├── questions_data.json   # Full dataset in JSON format
├── wrangler.toml         # Cloudflare Pages configuration
├── scripts/
│   ├── build_all.py      # Automated dataset compiler & schema validator
│   ├── day1_data.py      # Day 1: 50 Questions with options & explanations
│   ├── day2_data.py      # Day 2: 50 Questions
│   ├── day3_data.py      # Day 3: 50 Questions
│   ├── day4_data.py      # Day 4: 50 Questions
│   ├── day5_data.py      # Day 5: 50 Questions
│   ├── day6_data.py      # Day 6: 50 Questions
│   ├── day7_data.py      # Day 7: 50 Questions
│   └── day8_data.py      # Day 8: 50 Questions
└── README.md
```

---

## 📄 License
MIT License. Created for SSC GK/GS Exam Preparation.
