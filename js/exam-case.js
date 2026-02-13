/* =================================
   STUDI KASUS ENGINE - ESSAY MODE
================================= */

const caseState = JSON.parse(localStorage.getItem("examState"));
if (!caseState) window.location.href = "dashboard.html";

const topics = [
  "Media Pembelajaran",
  "LKPD",
  "Strategi Pembelajaran",
  "Penilaian"
];

let selectedTopic = localStorage.getItem("caseTopic");
if (!selectedTopic) {
  selectedTopic = topics[Math.floor(Math.random() * topics.length)];
  localStorage.setItem("caseTopic", selectedTopic);
}

const steps = [
  "Deskripsi Masalah Nyata",
  "Upaya Penyelesaian",
  "Hasil",
  "Hikmah / Pengalaman Berharga"
];

let currentStep = parseInt(localStorage.getItem("caseStep")) || 0;
let answers = JSON.parse(localStorage.getItem("caseAnswers")) || [];


/* ================= INIT ================= */

renderStep();


function renderStep() {

  const container = document.getElementById("caseBox");

  if (currentStep >= steps.length) {
    finishCase();
    return;
  }

  container.innerHTML = `
    <h3>${selectedTopic}</h3>
    <h4>${steps[currentStep]}</h4>

    <textarea id="essayInput" 
      maxlength="150"
      placeholder="Tulis jawaban maksimal 150 kata..."
      style="width:100%;height:150px;"></textarea>

    <div style="margin-top:8px;">
      <span id="wordCount">0</span>/150 kata
    </div>

    <button onclick="saveStep()" 
      style="margin-top:12px;">Simpan & Lanjut</button>
  `;

  document
    .getElementById("essayInput")
    .addEventListener("input", updateCounter);
}


/* ================= WORD COUNTER ================= */

function updateCounter() {

  const text = document.getElementById("essayInput").value.trim();
  const words = text === "" ? 0 : text.split(/\s+/).length;

  document.getElementById("wordCount").innerText = words;
}


/* ================= SAVE STEP ================= */

function saveStep() {

  const text = document.getElementById("essayInput").value.trim();

  if (!text) {
    alert("Jawaban tidak boleh kosong");
    return;
  }

  answers[currentStep] = text;

  localStorage.setItem("caseAnswers", JSON.stringify(answers));

  currentStep++;
  localStorage.setItem("caseStep", currentStep);

  renderStep();
}


/* ================= FINISH ================= */

function finishCase() {

  const totalWords = answers.reduce((acc, txt) => {
    return acc + (txt.split(/\s+/).length);
  }, 0);

  const totalChars = answers.reduce((acc, txt) => {
    return acc + txt.length;
  }, 0);

  localStorage.setItem("caseTotalWords", totalWords);
  localStorage.setItem("caseTotalChars", totalChars);

  window.location.href = "result.html";
}
