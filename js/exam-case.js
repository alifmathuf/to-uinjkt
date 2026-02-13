/* =================================
   STUDI KASUS ENGINE - FINAL CLEAN
================================= */

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

let selectedTopic = localStorage.getItem("caseTopic");
let currentStep = parseInt(localStorage.getItem("caseStep")) || 0;
let answers = JSON.parse(localStorage.getItem("caseAnswers")) || [];

let duration = 30 * 60; // 30 menit
let caseEndTime;
let timerInterval;


/* ================= INIT ================= */

initCase();

function initCase(){

  // Random topic hanya pertama kali
  if(!selectedTopic){
    selectedTopic = topics[Math.floor(Math.random()*topics.length)];
    localStorage.setItem("caseTopic", selectedTopic);
  }

  document.getElementById("caseTopic").innerText =
    selectedTopic.toUpperCase();

  startCaseTimer();
  renderStep();
}


/* ================= TIMER ================= */

function startCaseTimer(){

  const saved = localStorage.getItem("caseEndTime");

  if(saved){
    caseEndTime = parseInt(saved);
  } else {
    caseEndTime = Date.now() + duration*1000;
    localStorage.setItem("caseEndTime", caseEndTime);
  }

  timerInterval = setInterval(()=>{

    const remain = Math.floor((caseEndTime - Date.now())/1000);

    if(remain <= 0){
      clearInterval(timerInterval);
      finishCase();
      return;
    }

    const m = Math.floor(remain/60);
    const s = remain%60;

    const timerEl = document.getElementById("caseTimer");
    if(timerEl){
      timerEl.innerText =
        `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
    }

  },1000);
}


/* ================= RENDER STEP ================= */

function renderStep(){

  if(currentStep >= steps.length){
    finishCase();
    return;
  }

  document.getElementById("caseStepInfo").innerText =
    `Soal ${currentStep+1} dari 4`;

  document.getElementById("caseStepTitle").innerText =
    steps[currentStep];

  const textarea = document.getElementById("essayInput");
  textarea.value = answers[currentStep] || "";



   updateProgress();
  updateCounter();
}

function updateProgress(){

  const total = soalUjian.length;
  const percent = ((current+1)/total)*100;

  document.getElementById("progressText").innerText =
    `${current+1} / ${total}`;

  document.getElementById("progressFill").style.width =
    percent + "%";
}
/* ================= WORD COUNTER ================= */

function updateCounter(){

  const text = document.getElementById("essayInput").value.trim();
  const words = text === "" ? 0 : text.split(/\s+/).length;

  document.getElementById("wordCount").innerText = words;
}

document
  .getElementById("essayInput")
  .addEventListener("input", updateCounter);


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

function finishCase(){

  if(timerInterval){
    clearInterval(timerInterval);
  }

  const totalWords = answers.reduce((acc, txt)=>{
    return acc + (txt ? txt.split(/\s+/).length : 0);
  },0);

  const totalChars = answers.reduce((acc, txt)=>{
    return acc + (txt ? txt.length : 0);
  },0);

  localStorage.setItem("caseTotalWords", totalWords);
  localStorage.setItem("caseTotalChars", totalChars);

  // reset state agar ujian berikutnya fresh
  localStorage.removeItem("caseStep");
  localStorage.removeItem("caseEndTime");

  window.location.href = "result.html";
}
function checkFinishAvailability(){
  const filled = jawaban.every(j => j && j.trim().length > 0);
  document.getElementById("finishBtn").disabled = !filled;
}


