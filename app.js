/**
 * SSC GK/GS Bilingual Master Quiz Application
 * Handles Day 1-8 (400 MCQs), Practice & Exam Modes, Bilingual rendering (EN/HI),
 * Circular SVG Countdown Timer, Audio synthesis, Question Grid, and Search.
 */

(function () {
  'use strict';

  // --- State Variables ---
  let allQuestions = [];
  let activeQuestions = [];
  let currentFilter = '1'; // '1'..'8', 'all', 'bookmarks', 'mistakes'
  let currentIndex = 0;
  let currentLang = 'en'; // 'en' | 'hi'
  let quizMode = 'practice'; // 'practice' | 'exam'
  let soundEnabled = true;
  let isWideMode = false;

  // Question response states
  let userAnswers = {}; // { [qId]: selectedOptionIndex }
  let bookmarkedIds = new Set();

  // Timer Variables
  const QUESTION_TIME_LIMIT = 20; // 20s circular timer per question
  let timeLeft = QUESTION_TIME_LIMIT;
  let timerInterval = null;
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 28; // ~175.93 for r=28

  // Audio Context (Synthesizer)
  let audioCtx = null;

  // --- DOM Elements ---
  const el = {
    body: document.body,
    activeDayLabel: document.getElementById('activeDayLabel'),
    daySelectBtn: document.getElementById('daySelectBtn'),
    dayMenu: document.getElementById('dayMenu'),
    langEnBtn: document.getElementById('langEnBtn'),
    langHiBtn: document.getElementById('langHiBtn'),
    modeToggleBtn: document.getElementById('modeToggleBtn'),
    modeIndicator: document.getElementById('modeIndicator'),
    soundToggleBtn: document.getElementById('soundToggleBtn'),
    soundIcon: document.getElementById('soundIcon'),
    searchBtn: document.getElementById('searchBtn'),
    previewFrameToggle: document.getElementById('previewFrameToggle'),
    deviceTime: document.getElementById('deviceTime'),
    
    // Header & Stats
    counterText: document.getElementById('counterText'),
    progressBar: document.getElementById('progressBar'),
    scorePillText: document.getElementById('scorePillText'),
    
    // Circular Timer
    timerBadge: document.getElementById('timerBadge'),
    timerCircle: document.getElementById('timerCircle'),
    timerSeconds: document.getElementById('timerSeconds'),
    
    // Question Card
    hintBtn: document.getElementById('hintBtn'),
    hintLabel: document.getElementById('hintLabel'),
    bookmarkBtn: document.getElementById('bookmarkBtn'),
    bookmarkIcon: document.getElementById('bookmarkIcon'),
    hintBox: document.getElementById('hintBox'),
    hintCloseBtn: document.getElementById('hintCloseBtn'),
    hintContent: document.getElementById('hintContent'),
    questionPrefix: document.getElementById('questionPrefix'),
    qNumDisplay: document.getElementById('qNumDisplay'),
    questionCategory: document.getElementById('questionCategory'),
    questionText: document.getElementById('questionText'),
    optionsContainer: document.getElementById('optionsContainer'),
    
    // Explanation
    explanationBox: document.getElementById('explanationBox'),
    expTitle: document.getElementById('expTitle'),
    explanationText: document.getElementById('explanationText'),
    
    // Navigation Action Bar
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    nextBtnText: document.getElementById('nextBtnText'),
    
    // Desktop Side Palette
    sidePalette: document.getElementById('sidePalette'),
    paletteBadge: document.getElementById('paletteBadge'),
    paletteGrid: document.getElementById('paletteGrid'),
    filterBookmarkedBtn: document.getElementById('filterBookmarkedBtn'),
    bookmarkCount: document.getElementById('bookmarkCount'),
    examSubmitBtn: document.getElementById('examSubmitBtn'),
    
    // Search Modal
    searchModal: document.getElementById('searchModal'),
    searchModalClose: document.getElementById('searchModalClose'),
    searchInput: document.getElementById('searchInput'),
    searchResultCount: document.getElementById('searchResultCount'),
    searchResultsList: document.getElementById('searchResultsList'),
    
    // Results Modal
    resultsModal: document.getElementById('resultsModal'),
    resultsModalClose: document.getElementById('resultsModalClose'),
    resScore: document.getElementById('resScore'),
    resTotal: document.getElementById('resTotal'),
    resGrade: document.getElementById('resGrade'),
    resCorrect: document.getElementById('resCorrect'),
    resWrong: document.getElementById('resWrong'),
    resSkipped: document.getElementById('resSkipped'),
    resAccuracy: document.getElementById('resAccuracy'),
    restartQuizBtn: document.getElementById('restartQuizBtn'),
    reviewMistakesBtn: document.getElementById('reviewMistakesBtn'),
    nextDayBtn: document.getElementById('nextDayBtn'),
  };

  // --- Initialize App ---
  function init() {
    loadLocalPreferences();
    updateLiveDeviceTime();
    setInterval(updateLiveDeviceTime, 60000);

    // Load questions data
    if (window.QUIZ_DATA && Array.isArray(window.QUIZ_DATA) && window.QUIZ_DATA.length > 0) {
      allQuestions = window.QUIZ_DATA;
      setupQuizModule('1');
    } else {
      fetch('questions_data.json')
        .then(res => res.json())
        .then(data => {
          allQuestions = data;
          setupQuizModule('1');
        })
        .catch(err => {
          console.error("Failed to load questions data:", err);
          el.questionText.textContent = "Error loading quiz data. Please refresh or run scripts/build_all.py";
        });
    }

    attachEventListeners();
  }

  // --- LocalStorage Support ---
  function loadLocalPreferences() {
    try {
      const savedBookmarks = localStorage.getItem('ssc_quiz_bookmarks');
      if (savedBookmarks) {
        bookmarkedIds = new Set(JSON.parse(savedBookmarks));
        updateBookmarkCountUI();
      }
      const savedSound = localStorage.getItem('ssc_quiz_sound');
      if (savedSound !== null) {
        soundEnabled = savedSound === 'true';
        updateSoundUI();
      }
    } catch (e) {
      console.warn("localStorage not accessible:", e);
    }
  }

  function saveBookmarks() {
    try {
      localStorage.setItem('ssc_quiz_bookmarks', JSON.stringify(Array.from(bookmarkedIds)));
      updateBookmarkCountUI();
    } catch (e) {}
  }

  function updateBookmarkCountUI() {
    if (el.bookmarkCount) {
      el.bookmarkCount.textContent = bookmarkedIds.size;
    }
  }

  function updateSoundUI() {
    el.soundIcon.textContent = soundEnabled ? '🔊' : '🔇';
  }

  // --- Live Status Bar Clock ---
  function updateLiveDeviceTime() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? '' : '';
    hours = hours % 12 || 12;
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    if (el.deviceTime) {
      el.deviceTime.textContent = `${hours}:${strMinutes}`;
    }
  }

  // --- Audio Synthesis (Web Audio API) ---
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playTone(freq, type, duration, startVol = 0.2, endVol = 0.001) {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(startVol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(endVol, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  }

  function playSound(type) {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    if (type === 'correct') {
      // Pleasant high two-tone chime
      playTone(523.25, 'sine', 0.15, 0.2); // C5
      setTimeout(() => playTone(659.25, 'sine', 0.25, 0.25), 100); // E5
    } else if (type === 'wrong') {
      // Soft low buzz
      playTone(240, 'sawtooth', 0.2, 0.15);
      setTimeout(() => playTone(180, 'sawtooth', 0.25, 0.15), 90);
    } else if (type === 'click') {
      // Subtle tactile click
      playTone(750, 'sine', 0.04, 0.08);
    } else if (type === 'tick') {
      playTone(900, 'sine', 0.02, 0.04);
    }
  }

  // --- Setup Quiz Module ---
  function setupQuizModule(filter) {
    currentFilter = filter;
    currentIndex = 0;
    userAnswers = {};

    if (filter === 'all') {
      activeQuestions = [...allQuestions];
      el.activeDayLabel.textContent = "Full Mock (400)";
      el.paletteBadge.textContent = "1 - 400";
    } else if (filter === 'bookmarks') {
      activeQuestions = allQuestions.filter(q => bookmarkedIds.has(q.id));
      el.activeDayLabel.textContent = `Bookmarks (${activeQuestions.length})`;
      el.paletteBadge.textContent = `★ ${activeQuestions.length}`;
      if (activeQuestions.length === 0) {
        alert("No bookmarked questions yet! Click the star icon (☆) on any question to bookmark it.");
        setupQuizModule('1');
        return;
      }
    } else if (filter === 'mistakes') {
      // Filter questions user got wrong in the previous session
      activeQuestions = allQuestions.filter(q => {
        const ans = userAnswers[q.id];
        return ans !== undefined && ans !== q.answerIndex;
      });
      el.activeDayLabel.textContent = `Mistakes (${activeQuestions.length})`;
      el.paletteBadge.textContent = `❌ ${activeQuestions.length}`;
    } else {
      const dayNum = parseInt(filter, 10);
      activeQuestions = allQuestions.filter(q => q.day === dayNum);
      el.activeDayLabel.textContent = `Day ${dayNum}`;
      el.paletteBadge.textContent = `Day ${dayNum} (50 Qs)`;
    }

    // Update active class in day dropdown
    document.querySelectorAll('.day-opt-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.day === filter);
    });

    renderPaletteGrid();
    renderCurrentQuestion();
    startQuestionTimer();
  }

  // --- Render Palette Grid ---
  function renderPaletteGrid() {
    el.paletteGrid.innerHTML = '';
    activeQuestions.forEach((q, idx) => {
      const btn = document.createElement('button');
      btn.className = 'palette-btn';
      btn.textContent = idx + 1;
      btn.dataset.index = idx;

      // Update styling based on response
      updatePaletteButtonState(btn, q, idx);

      btn.addEventListener('click', () => {
        playSound('click');
        jumpToQuestion(idx);
      });

      el.paletteGrid.appendChild(btn);
    });
  }

  function updatePaletteButtonState(btn, q, idx) {
    btn.classList.remove('current', 'correct', 'wrong', 'bookmarked');

    if (idx === currentIndex) {
      btn.classList.add('current');
    }

    if (bookmarkedIds.has(q.id)) {
      btn.classList.add('bookmarked');
    }

    const ans = userAnswers[q.id];
    if (ans !== undefined) {
      if (quizMode === 'practice') {
        if (ans === q.answerIndex) {
          btn.classList.add('correct');
        } else {
          btn.classList.add('wrong');
        }
      } else {
        // In exam mode, simply mark as answered
        btn.classList.add('correct');
      }
    }
  }

  function refreshPaletteItem(idx) {
    const btn = el.paletteGrid.children[idx];
    if (btn && activeQuestions[idx]) {
      updatePaletteButtonState(btn, activeQuestions[idx], idx);
    }
  }

  // Category Hindi translations
  const CATEGORY_MAP_HI = {
    "Important Days": "महत्वपूर्ण दिवस",
    "Science & Technology": "विज्ञान एवं प्रौद्योगिकी",
    "Physics": "भौतिक विज्ञान",
    "Chemistry": "रसायन विज्ञान",
    "Biology": "जीव विज्ञान",
    "Indian Polity": "भारतीय राजव्यवस्था",
    "Indian Polity & Constitution": "भारतीय संविधान व राजव्यवस्था",
    "Modern Indian History": "आधुनिक भारतीय इतिहास",
    "Indian Geography": "भारत का भूगोल",
    "Ancient History": "प्राचीन भारतीय इतिहास",
    "Medieval History": "मध्यकालीन भारतीय इतिहास",
    "Art & Culture": "कला एवं संस्कृति",
    "Sports & Games": "खेलकूद",
    "Economics": "अर्थशास्त्र",
    "Environment & Ecology": "पर्यावरण एवं पारिस्थितिकी",
    "General Knowledge": "सामान्य ज्ञान"
  };

  // --- Render Current Question ---
  function renderCurrentQuestion() {
    if (!activeQuestions || activeQuestions.length === 0) return;
    const q = activeQuestions[currentIndex];
    const total = activeQuestions.length;

    // Language strings
    const isHi = currentLang === 'hi';
    el.body.classList.toggle('lang-hi', isHi);
    el.body.classList.toggle('lang-en', !isHi);

    // Question Number & Badges
    const displayNum = currentIndex + 1;
    const padNum = displayNum < 10 ? '0' + displayNum : displayNum;
    const padTotal = total < 10 ? '0' + total : total;

    el.questionPrefix.textContent = isHi ? "प्रश्न" : "Question";
    el.qNumDisplay.textContent = padNum;
    el.counterText.textContent = `${padNum} of ${padTotal}`;

    // Category
    const catEn = q.category || "General Knowledge";
    el.questionCategory.textContent = isHi ? (CATEGORY_MAP_HI[catEn] || catEn) : catEn;

    // Question Text (with quotation marks)
    const qText = isHi ? q.question.hi : q.question.en;
    el.questionText.textContent = `"${qText}"`;

    // Progress Bar
    const progressPct = ((currentIndex + 1) / total) * 100;
    el.progressBar.style.width = `${progressPct}%`;

    // Score Pill Update
    updateScorePill();

    // Hint Box reset
    el.hintBox.classList.remove('open');
    el.hintContent.textContent = isHi ? q.hint.hi : q.hint.en;
    el.hintLabel.textContent = isHi ? "संकेत" : "Hint";

    // Bookmark Status
    const isBookmarked = bookmarkedIds.has(q.id);
    el.bookmarkBtn.classList.toggle('active', isBookmarked);
    el.bookmarkIcon.textContent = isBookmarked ? '★' : '☆';

    // Navigation buttons state
    el.prevBtn.disabled = currentIndex === 0;
    if (currentIndex === total - 1) {
      el.nextBtnText.textContent = quizMode === 'exam' ? (isHi ? "समाप्त करें" : "Submit Exam") : (isHi ? "परिणाम देखें" : "View Results");
    } else {
      el.nextBtnText.textContent = isHi ? "अगला प्रश्न" : "Next";
    }

    // Render Options
    renderOptions(q);

    // Render Explanation
    renderExplanation(q);

    // Refresh Palette focus
    Array.from(el.paletteGrid.children).forEach((btn, i) => {
      btn.classList.toggle('current', i === currentIndex);
    });
  }

  // --- Render Options ---
  function renderOptions(q) {
    el.optionsContainer.innerHTML = '';
    const isHi = currentLang === 'hi';
    const letters = ['A', 'B', 'C', 'D'];
    const currentAnswer = userAnswers[q.id];
    const isAnswered = currentAnswer !== undefined;

    const checkSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    const crossSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

    q.options.forEach((opt, idx) => {
      const optText = isHi ? opt.hi : opt.en;
      const card = document.createElement('div');
      card.className = 'option-card';
      card.dataset.index = idx;

      let indicatorHtml = '';

      // Determine state
      if (isAnswered) {
        card.classList.add('disabled');
        if (quizMode === 'practice') {
          if (idx === q.answerIndex) {
            if (currentAnswer === q.answerIndex) {
              card.classList.add('correct');
              indicatorHtml = checkSvg;
            } else {
              card.classList.add('revealed-correct');
              indicatorHtml = checkSvg;
            }
          } else if (idx === currentAnswer) {
            card.classList.add('wrong');
            indicatorHtml = crossSvg;
          }
        } else {
          // Exam Mode
          if (idx === currentAnswer) {
            card.classList.add('selected');
            indicatorHtml = checkSvg;
          }
        }
      }

      card.innerHTML = `
        <div class="option-left">
          <span class="option-letter">${letters[idx]}</span>
          <span class="option-text">${optText}</span>
        </div>
        <div class="option-indicator">${indicatorHtml}</div>
      `;

      card.addEventListener('click', () => {
        if (userAnswers[q.id] !== undefined) return; // already answered
        handleOptionSelect(q, idx);
      });

      el.optionsContainer.appendChild(card);
    });
  }

  // --- Handle Option Selection ---
  function handleOptionSelect(q, selectedIdx) {
    userAnswers[q.id] = selectedIdx;
    const isCorrect = selectedIdx === q.answerIndex;

    // Audio feedback
    if (quizMode === 'practice') {
      playSound(isCorrect ? 'correct' : 'wrong');
    } else {
      playSound('click');
    }

    // Re-render options to display state
    renderOptions(q);

    // Show explanation if in practice mode
    renderExplanation(q);

    // Update score pill and question palette
    updateScorePill();
    refreshPaletteItem(currentIndex);

    // In practice mode, stop timer on answer
    if (quizMode === 'practice') {
      clearInterval(timerInterval);
    }
  }

  // --- Render Explanation Box ---
  function renderExplanation(q) {
    const isAnswered = userAnswers[q.id] !== undefined;
    const isHi = currentLang === 'hi';

    if (isAnswered && quizMode === 'practice') {
      el.expTitle.textContent = isHi ? "विस्तृत व्याख्या एवं मुख्य तथ्य" : "Detailed SSC Analysis & Key Facts";
      el.explanationText.textContent = isHi ? q.explanation.hi : q.explanation.en;
      el.explanationBox.classList.add('open');
    } else {
      el.explanationBox.classList.remove('open');
    }
  }

  // --- Update Score Pill ---
  function updateScorePill() {
    const total = activeQuestions.length;
    let correctCount = 0;
    activeQuestions.forEach(q => {
      if (userAnswers[q.id] === q.answerIndex) {
        correctCount++;
      }
    });

    const padCorrect = correctCount < 10 ? '0' + correctCount : correctCount;
    const padTotal = total < 10 ? '0' + total : total;

    if (el.scorePillText) {
      el.scorePillText.textContent = `${padCorrect} of ${padTotal}`;
    }
  }

  // --- Circular Countdown Timer Logic ---
  function startQuestionTimer() {
    clearInterval(timerInterval);
    timeLeft = QUESTION_TIME_LIMIT;
    updateTimerVisual(timeLeft);

    timerInterval = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        timeLeft = 0;
        updateTimerVisual(timeLeft);
        clearInterval(timerInterval);
        handleTimerExpiry();
      } else {
        updateTimerVisual(timeLeft);
        if (timeLeft <= 5) {
          playSound('tick');
        }
      }
    }, 1000);
  }

  function updateTimerVisual(seconds) {
    if (el.timerSeconds) {
      el.timerSeconds.textContent = seconds < 10 ? '0' + seconds : seconds;
    }

    // Animate SVG stroke-dashoffset
    const progressFraction = (QUESTION_TIME_LIMIT - seconds) / QUESTION_TIME_LIMIT;
    const offset = CIRCLE_CIRCUMFERENCE * progressFraction;
    if (el.timerCircle) {
      el.timerCircle.style.strokeDashoffset = offset;
    }

    // Toggle danger state when under 5s
    if (el.timerBadge) {
      el.timerBadge.classList.toggle('danger', seconds <= 5 && seconds > 0);
    }
  }

  function handleTimerExpiry() {
    // In practice mode, we do NOT lock out or mark wrong!
    // Simply indicate time warning so the user can still read and select an answer.
    if (el.timerBadge) {
      el.timerBadge.classList.add('danger');
    }
  }

  // --- Navigation Controls ---
  function jumpToQuestion(idx) {
    if (idx < 0 || idx >= activeQuestions.length) return;
    currentIndex = idx;
    renderCurrentQuestion();
    startQuestionTimer();
  }

  function nextQuestion() {
    playSound('click');
    if (currentIndex < activeQuestions.length - 1) {
      currentIndex++;
      renderCurrentQuestion();
      startQuestionTimer();
    } else {
      // Reached the end: Show Results Summary!
      showResultsModal();
    }
  }

  function prevQuestion() {
    playSound('click');
    if (currentIndex > 0) {
      currentIndex--;
      renderCurrentQuestion();
      startQuestionTimer();
    }
  }

  // --- Results Modal & Analytics ---
  function showResultsModal() {
    clearInterval(timerInterval);
    playSound('correct');

    const total = activeQuestions.length;
    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    activeQuestions.forEach(q => {
      const ans = userAnswers[q.id];
      if (ans === undefined || ans === -1) {
        skipped++;
      } else if (ans === q.answerIndex) {
        correct++;
      } else {
        wrong++;
      }
    });

    const answeredCount = correct + wrong;
    const accuracy = answeredCount > 0 ? ((correct / answeredCount) * 100).toFixed(1) : 0;
    
    // SSC Marking Scheme: +2 for correct, -0.5 for incorrect
    const sscScore = ((correct * 2) - (wrong * 0.5)).toFixed(1);
    const maxScore = total * 2;

    el.resScore.textContent = correct;
    el.resTotal.textContent = `/ ${total}`;
    el.resCorrect.textContent = correct;
    el.resWrong.textContent = wrong;
    el.resSkipped.textContent = skipped;
    el.resAccuracy.textContent = `${accuracy}%`;

    // Grade assignment
    const pct = (correct / total) * 100;
    if (pct >= 85) {
      el.resGrade.textContent = "🌟 Rank 1 Level! Outstanding GK Mastery!";
      el.resGrade.style.color = "#2ed573";
    } else if (pct >= 65) {
      el.resGrade.textContent = "👍 Solid Performance! Qualifies Cutoff!";
      el.resGrade.style.color = "#ffbe21";
    } else {
      el.resGrade.textContent = "📚 Needs Revision! Review explanations below.";
      el.resGrade.style.color = "#ff7622";
    }

    el.resultsModal.classList.add('open');
  }

  // --- Search System ---
  function performSearch(query) {
    query = query.trim().toLowerCase();
    if (!query) {
      el.searchResultCount.textContent = "Type to search...";
      el.searchResultsList.innerHTML = '';
      return;
    }

    const matches = allQuestions.filter(q => {
      const qEn = (q.question && q.question.en ? q.question.en.toLowerCase() : '');
      const qHi = (q.question && q.question.hi ? q.question.hi.toLowerCase() : '');
      const cat = (q.category ? q.category.toLowerCase() : '');
      const expEn = (q.explanation && q.explanation.en ? q.explanation.en.toLowerCase() : '');
      const expHi = (q.explanation && q.explanation.hi ? q.explanation.hi.toLowerCase() : '');

      return qEn.includes(query) || qHi.includes(query) || cat.includes(query) || expEn.includes(query) || expHi.includes(query);
    });

    el.searchResultCount.textContent = `Found ${matches.length} matching questions`;
    el.searchResultsList.innerHTML = '';

    if (matches.length === 0) {
      el.searchResultsList.innerHTML = '<div style="padding: 16px; color: #8a88a5; text-align: center;">No questions match your query.</div>';
      return;
    }

    matches.slice(0, 50).forEach(q => {
      const item = document.createElement('div');
      item.className = 'search-item';
      const isHi = currentLang === 'hi';
      const qText = isHi ? q.question.hi : q.question.en;

      item.innerHTML = `
        <div class="search-item-badge">Day ${q.day} • Q${q.qNum} • ${q.category}</div>
        <div class="search-item-q">${qText}</div>
      `;

      item.addEventListener('click', () => {
        el.searchModal.classList.remove('open');
        // Jump directly to this day and question
        setupQuizModule(String(q.day));
        jumpToQuestion(q.qNum - 1);
      });

      el.searchResultsList.appendChild(item);
    });
  }

  // --- Event Listeners ---
  function attachEventListeners() {
    // Day dropdown toggle
    el.daySelectBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      el.dayMenu.classList.toggle('open');
    });

    document.addEventListener('click', () => {
      el.dayMenu.classList.remove('open');
    });

    // Day option buttons
    document.querySelectorAll('.day-opt-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        playSound('click');
        const day = btn.dataset.day;
        el.dayMenu.classList.remove('open');
        setupQuizModule(day);
      });
    });

    // Language Switcher
    el.langEnBtn.addEventListener('click', () => {
      if (currentLang === 'en') return;
      currentLang = 'en';
      el.langEnBtn.classList.add('active');
      el.langHiBtn.classList.remove('active');
      playSound('click');
      renderCurrentQuestion();
    });

    el.langHiBtn.addEventListener('click', () => {
      if (currentLang === 'hi') return;
      currentLang = 'hi';
      el.langHiBtn.classList.add('active');
      el.langEnBtn.classList.remove('active');
      playSound('click');
      renderCurrentQuestion();
    });

    // Practice / Exam Mode Toggle
    el.modeToggleBtn.addEventListener('click', () => {
      playSound('click');
      quizMode = quizMode === 'practice' ? 'exam' : 'practice';
      el.modeIndicator.textContent = quizMode === 'practice' ? 'Practice' : 'Exam';
      el.modeIndicator.className = `mode-indicator ${quizMode}`;
      renderCurrentQuestion();
      renderPaletteGrid();
    });

    // Sound toggle
    el.soundToggleBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      updateSoundUI();
      try {
        localStorage.setItem('ssc_quiz_sound', soundEnabled);
      } catch (e) {}
      if (soundEnabled) playSound('click');
    });

    // Mobile View / Wide Toggle
    if (el.previewFrameToggle) {
      el.previewFrameToggle.addEventListener('click', () => {
        isWideMode = !isWideMode;
        el.body.classList.toggle('wide-mode', isWideMode);
        const icon = el.previewFrameToggle.querySelector('.btn-icon');
        const text = el.previewFrameToggle.querySelector('.btn-text');
        if (isWideMode) {
          icon.textContent = '🖥️';
          text.textContent = 'Wide View';
        } else {
          icon.textContent = '📱';
          text.textContent = 'Mobile View';
        }
      });
    }

    // Hint toggle
    el.hintBtn.addEventListener('click', () => {
      playSound('click');
      el.hintBox.classList.toggle('open');
    });

    el.hintCloseBtn.addEventListener('click', () => {
      el.hintBox.classList.remove('open');
    });

    // Bookmark Toggle
    el.bookmarkBtn.addEventListener('click', () => {
      const q = activeQuestions[currentIndex];
      playSound('click');
      if (bookmarkedIds.has(q.id)) {
        bookmarkedIds.delete(q.id);
      } else {
        bookmarkedIds.add(q.id);
      }
      saveBookmarks();
      renderCurrentQuestion();
      refreshPaletteItem(currentIndex);
    });

    // Filter Bookmarks Button
    if (el.filterBookmarkedBtn) {
      el.filterBookmarkedBtn.addEventListener('click', () => {
        playSound('click');
        setupQuizModule('bookmarks');
      });
    }

    // Submit Exam from side palette
    if (el.examSubmitBtn) {
      el.examSubmitBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to submit and view your final scorecard?")) {
          showResultsModal();
        }
      });
    }

    // Navigation buttons
    el.nextBtn.addEventListener('click', nextQuestion);
    el.prevBtn.addEventListener('click', prevQuestion);

    // Keyboard navigation (Arrow keys & 1-4 for options)
    document.addEventListener('keydown', (e) => {
      if (el.searchModal.classList.contains('open')) return;
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        nextQuestion();
      } else if (e.key === 'ArrowLeft') {
        prevQuestion();
      } else if (['1', '2', '3', '4'].includes(e.key)) {
        const optIdx = parseInt(e.key, 10) - 1;
        const q = activeQuestions[currentIndex];
        if (userAnswers[q.id] === undefined && optIdx >= 0 && optIdx < 4) {
          handleOptionSelect(q, optIdx);
        }
      }
    });

    // Search modal open/close
    el.searchBtn.addEventListener('click', () => {
      playSound('click');
      el.searchModal.classList.add('open');
      setTimeout(() => el.searchInput.focus(), 100);
    });

    el.searchModalClose.addEventListener('click', () => {
      el.searchModal.classList.remove('open');
    });

    el.searchModal.addEventListener('click', (e) => {
      if (e.target === el.searchModal) el.searchModal.classList.remove('open');
    });

    let searchTimeout = null;
    el.searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        performSearch(e.target.value);
      }, 200);
    });

    // Results modal buttons
    el.resultsModalClose.addEventListener('click', () => {
      el.resultsModal.classList.remove('open');
    });

    el.restartQuizBtn.addEventListener('click', () => {
      el.resultsModal.classList.remove('open');
      setupQuizModule(currentFilter);
    });

    el.reviewMistakesBtn.addEventListener('click', () => {
      el.resultsModal.classList.remove('open');
      setupQuizModule('mistakes');
    });

    el.nextDayBtn.addEventListener('click', () => {
      el.resultsModal.classList.remove('open');
      let nextDay = parseInt(currentFilter, 10) + 1;
      if (isNaN(nextDay) || nextDay > 8) nextDay = 1;
      setupQuizModule(String(nextDay));
    });
  }

  // Run initial boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
