/* =================================
   STUDI KASUS ENGINE - FINAL FIX
================================= */
function getKey(key) {
  const user = Auth.getUser();
  if (!user) return key;
  return `${key}_${user.id}`;
}

const caseState = JSON.parse(localStorage.getItem("examState"));
if (!caseState) window.location.href = "../dashboard.html";

/* ================= CONFIG ================= */

const topics = [
  "Media",
  "LKPD",
  "Strategi Pembelajaran",
  "Penilaian"
];

const steps = [
  "Deskripsi Masalah Nyata",
  "Upaya Penyelesaian",
  "Hasil",
  "Hikmah / Pengalaman Berharga"
];

let selectedTopic = localStorage.getItem(getKey("caseTopic"));
let currentStep = parseInt(localStorage.getItem(getKey("caseStep"))) || 0;
let answers = JSON.parse(localStorage.getItem(getKey("caseAnswers"))) || [];

let duration = 30 * 60;
let caseEndTime;
let timerInterval;

/* ================= INIT ================= */
initCase();

function initCase() {
  if (!selectedTopic) {
    selectedTopic = topics[Math.floor(Math.random() * topics.length)];
    localStorage.setItem(getKey("caseTopic"), selectedTopic);
  }

  const topicEl = document.getElementById("caseTopic");
  if (topicEl) topicEl.innerText = selectedTopic.toUpperCase();

  startCaseTimer();
  renderStep();
}

/* ================= TIMER ================= */
function startCaseTimer() {
  const saved = localStorage.getItem(getKey("caseEndTime"));

  if (saved) caseEndTime = parseInt(saved);
  else {
    caseEndTime = Date.now() + duration * 1000;
    localStorage.setItem(getKey("caseEndTime"), caseEndTime);
  }

  timerInterval = setInterval(() => {
    const remain = Math.floor((caseEndTime - Date.now()) / 1000);
    if (remain <= 0) {
      clearInterval(timerInterval);
      finishCase();
      return;
    }
    const m = Math.floor(remain / 60);
    const s = remain % 60;
    const timerEl = document.getElementById("caseTimer");
    if (timerEl) timerEl.innerText =
      `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, 1000);
}

/* ================= RENDER STEP ================= */
function renderStep() {
  if (currentStep >= steps.length) {
    finishCase();
    return;
  }

  document.getElementById("caseStepInfo").innerText =
    `Soal ${currentStep + 1} dari ${steps.length}`;
  document.getElementById("caseStepTitle").innerText =
    steps[currentStep];

  const textarea = document.getElementById("essayInput");
  textarea.value = answers[currentStep] || "";

  updateProgress();
  updateCounter();
  updateButtons();
}

/* ================= PROGRESS ================= */
function updateProgress() {
  const total = steps.length;
  const percent = ((currentStep + 1) / total) * 100;
  const progressText = document.getElementById("progressText");
  const progressFill = document.getElementById("progressFill");

  if (progressText) progressText.innerText = `${currentStep + 1} / ${total}`;
  if (progressFill) progressFill.style.width = percent + "%";
}

/* ================= WORD COUNTER ================= */
function updateCounter() {
  const text = document.getElementById("essayInput").value.trim();
  const words = text === "" ? 0 : text.split(/\s+/).length;
  document.getElementById("wordCount").innerText = words;
}
document.getElementById("essayInput").addEventListener("input", updateCounter);

/* ================= BUTTON CONTROL ================= */
function updateButtons() {
  const saveNextBtn = document.getElementById("saveNextBtn");
  const finishBtn = document.getElementById("finishBtn");

  // Step 1-3: Simpan & Lanjut aktif, Selesai disabled
  // Step 4: Simpan & Lanjut disabled, Selesai aktif
  if (currentStep < 3) {
    if (saveNextBtn) {
      saveNextBtn.disabled = false;
      saveNextBtn.style.opacity = "1";
      saveNextBtn.style.cursor = "pointer";
    }
    if (finishBtn) {
      finishBtn.disabled = true;
      finishBtn.style.opacity = "0.5";
      finishBtn.style.cursor = "not-allowed";
    }
  } else {
    // Step 4 (terakhir)
    if (saveNextBtn) {
      saveNextBtn.disabled = true;
      saveNextBtn.style.opacity = "0.5";
      saveNextBtn.style.cursor = "not-allowed";
    }
    if (finishBtn) {
      finishBtn.disabled = false;
      finishBtn.style.opacity = "1";
      finishBtn.style.cursor = "pointer";
    }
  }
}


/* ================= SAVE & NEXT ================= */
function saveAndNext() {
  // Simpan jawaban current step
  const text = document.getElementById("essayInput").value.trim();
  answers[currentStep] = text;
  localStorage.setItem(getKey("caseAnswers"), JSON.stringify(answers));

  // Lanjut ke step berikutnya
  currentStep++;
  localStorage.setItem(getKey("caseStep"), currentStep);

  renderStep();
}

/* ================= FINISH ================= */
function finishCase() {
  if (timerInterval) clearInterval(timerInterval);

  // simpan jawaban terakhir (step 4)
  const text = document.getElementById("essayInput").value.trim();
  answers[currentStep] = text;
  localStorage.setItem(getKey("caseAnswers"), JSON.stringify(answers));

  // hitung statistik
  const totalWords = answers.reduce((acc, txt) => acc + (txt ? txt.split(/\s+/).length : 0), 0);
  const totalChars = answers.reduce((acc, txt) => acc + (txt ? txt.length : 0), 0);

  localStorage.setItem(getKey("caseTotalWords"), totalWords);
  localStorage.setItem(getKey("caseTotalChars"), totalChars);

  // cleanup progress tracking
  localStorage.removeItem(getKey("caseStep"));
  localStorage.removeItem(getKey("caseEndTime"));

  // redirect ke halaman hasil
  window.location.href = "result.html";
}

/* ================= FULLSCREEN PROTECTION ================= */
document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement) finishCase();
});
