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

let duration = 30 * 60;
let caseEndTime;
let timerInterval;


/* ================= INIT ================= */

initCase();

function initCase(){

  if(!selectedTopic){
    selectedTopic = topics[Math.floor(Math.random()*topics.length)];
    localStorage.setItem("caseTopic", selectedTopic);
  }

  const topicEl = document.getElementById("caseTopic");
  if(topicEl){
    topicEl.innerText = selectedTopic.toUpperCase();
  }

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
    `Soal ${currentStep+1} dari ${steps.length}`;

  document.getElementById("caseStepTitle").innerText =
    steps[currentStep];

  const textarea = document.getElementById("essayInput");
  textarea.value = answers[currentStep] || "";

  updateProgress();
  updateCounter();
  updateButtons();
}


/* ================= PROGRESS ================= */

function updateProgress(){

  const total = steps.length;
  const percent = ((currentStep+1)/total)*100;

  const progressText = document.getElementById("progressText");
  const progressFill = document.getElementById("progressFill");

  if(progressText){
    progressText.innerText =
      `${currentStep+1} / ${total}`;
  }

  if(progressFill){
    progressFill.style.width =
      percent + "%";
  }
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


/* ================= BUTTON CONTROL ================= */

function updateButtons(){

  const saveBtn = document.getElementById("saveBtn");
  const finishBtn = document.getElementById("finishBtn");

  if(saveBtn){
    saveBtn.disabled = currentStep === steps.length - 1;
  }

  if(finishBtn){
    finishBtn.disabled = currentStep !== steps.length - 1;
  }
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

  localStorage.removeItem("caseStep");
  localStorage.removeItem("caseEndTime");

  window.location.href = "result.html";
}
function exportCasePDF(){

  const cases = document.querySelectorAll(".case-result");

  if(!cases.length){
    alert("Data studi kasus tidak ditemukan");
    return;
  }

  let html = `
    <h2 style="text-align:center">HASIL STUDI KASUS</h2>
    <hr><br>
  `;

  cases.forEach(caseItem => {

    const judul = caseItem.querySelector(".case-title")?.innerText || "";

    const deskripsi = caseItem.querySelector(".case-desc")?.innerText || "-";
    const upaya = caseItem.querySelector(".case-effort")?.innerText || "-";
    const hasil = caseItem.querySelector(".case-result-text")?.innerText || "-";
    const hikmah = caseItem.querySelector(".case-wisdom")?.innerText || "-";

    html += `
      <h3>${judul}</h3>

      <table border="1" cellspacing="0" cellpadding="6" width="100%">
        <tr style="background:#eee">
          <th>Deskripsi</th>
          <th>Upaya</th>
          <th>Hasil</th>
          <th>Hikmah</th>
        </tr>
        <tr>
          <td>${deskripsi}</td>
          <td>${upaya}</td>
          <td>${hasil}</td>
          <td>${hikmah}</td>
        </tr>
      </table>

      <br><br>
    `;
  });

  html2pdf().from(html).set({
    margin: 10,
    filename: "Studi_Kasus.pdf",
    html2canvas: { scale: 2 },
    jsPDF: { unit: "mm", format: "a4", orientation: "landscape" }
  }).save();
}

