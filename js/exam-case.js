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
<div class="case-header">
  <div class="case-left">
    <span>Soal ${currentStep+1} dari 4</span>
  </div>

  <div class="case-right">
    <span class="badge">STUDI KASUS</span>
    <span class="topic">${selectedTopic.toUpperCase()}</span>
    <div id="caseTimer" class="timer"></div>
  </div>
</div>

<h4>${steps[currentStep]}</h4>

<textarea id="essayInput"
  placeholder="Minimal 150 kata..."
  class="essay-box"></textarea>

<div class="word-info">
  <span id="wordCount">0</span> / minimal 150 kata
</div>

<button class="btn-primary"
  onclick="saveStep()">Simpan & Lanjut</button>
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

function saveStep(){

  const text = document.getElementById("essayInput").value.trim();
  const words = text === "" ? 0 : text.split(/\s+/).length;

  if(words < 150){
    alert("Minimal 150 kata!");
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
let duration = 30 * 60;
let caseEndTime;

function startCaseTimer(){

  const saved = localStorage.getItem("caseEndTime");

  if(saved){
    caseEndTime = parseInt(saved);
  } else {
    caseEndTime = Date.now() + duration*1000;
    localStorage.setItem("caseEndTime", caseEndTime);
  }

  setInterval(()=>{

    const remain = Math.floor((caseEndTime - Date.now())/1000);

    if(remain <= 0){
      finishCase();
      return;
    }

    const m = Math.floor(remain/60);
    const s = remain%60;

    document.getElementById("caseTimer").innerText =
      `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;

  },1000);
}

