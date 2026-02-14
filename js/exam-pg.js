/* ===============================
   PG EXAM ENGINE - FINAL CLEAN PRODUCTION
================================ */

const examState = JSON.parse(localStorage.getItem("examState"));
if (!examState) window.location.href = "dashboard.html";

let soalData = [];
let soalUjian = [];
let jawaban = [];
let current = 0;

const duration = 120 * 60;
let endTime;
let timerInterval;


/* ================= LOAD SOAL ================= */

fetch(`paket/${examState.mapel}/${examState.paket}.json`)
  .then(res => {
    if (!res.ok) throw new Error("File soal tidak ditemukan");
    return res.json();
  })
  .then(data => {

    soalData = shuffle(data);
    soalUjian = soalData.slice(0, 50);

    const savedAnswers = localStorage.getItem("pgAnswers");
    jawaban = savedAnswers
      ? JSON.parse(savedAnswers)
      : new Array(soalUjian.length).fill(null);

    startTimer();
    renderNumberNav();
    renderQuestion();
    enterFullscreen();
  })
  .catch(err => {
    console.error(err);
    alert("Soal gagal dimuat. Periksa folder paket.");
  });


/* ================= TIMER ================= */

function startTimer() {

  const savedEnd = localStorage.getItem("examEndTime");

  if (savedEnd) {
    endTime = parseInt(savedEnd);
  } else {
    endTime = Date.now() + duration * 1000;
    localStorage.setItem("examEndTime", endTime);
  }

  timerInterval = setInterval(() => {

    const remaining = Math.floor((endTime - Date.now()) / 1000);

    if (remaining <= 0) {
      clearInterval(timerInterval);
      submitExam(true);
      return;
    }

    const m = Math.floor(remaining / 60);
    const s = remaining % 60;

    const timerEl = document.getElementById("timer");
    if (timerEl) {
      timerEl.innerText =
        `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }

  }, 1000);
}


/* ================= RENDER QUESTION ================= */

function renderQuestion() {

  const q = soalUjian[current];
  if (!q) return;

  const examInfo = document.getElementById("examInfo");
  if (examInfo) {
    examInfo.innerText =
      `${examState.mapel.toUpperCase()} | ${examState.paket}`;
  }

  const questionBox = document.getElementById("questionBox");
  if (!questionBox) return;

  questionBox.innerHTML = `
    <h3>Soal ${current + 1}</h3>
    <p>${q.q}</p>
    ${q.o.map((opt, i) => {
      const huruf = String.fromCharCode(65 + i);
      return `
        <label>
          <input type="radio" name="jawab"
          ${jawaban[current] === i ? "checked" : ""}
          onchange="saveAnswer(${i})">
          <strong>${huruf}.</strong> ${opt}
        </label>
      `;
    }).join("")}
  `;

  updateProgress();
  updateNumberNav();
  updateFinishButton();
}


/* ================= PROGRESS ================= */

function updateProgress(){

  const total = soalUjian.length;
  const percent = ((current + 1) / total) * 100;

  const progressText = document.getElementById("progressText");
  const progressFill = document.getElementById("progressFill");

  if (progressText) {
    progressText.innerText = `${current + 1} / ${total}`;
  }

  if (progressFill) {
    progressFill.style.width = percent + "%";
  }
}


/* ================= SAVE ANSWER ================= */

function saveAnswer(i) {

  jawaban[current] = i;

  // ✅ Backup local
  localStorage.setItem("pgAnswers", JSON.stringify(jawaban));

  // ✅ Kirim ke Firebase realtime
  try{

    if(typeof firebase !== "undefined"){

      const user = Auth.getUser();
      if(!user) return;

      const examId = examState.mapel + "_" + examState.paket;

      database.ref(`exams/${user.id}/${examId}`).update({
        mapel: examState.mapel,
        paket: examState.paket,
        answers: jawaban,
        lastSaved: Date.now()
      });

    }

  }catch(err){
    console.log("Firebase save skipped:", err);
  }

  updateNumberNav();
}


/* ================= NAVIGATION ================= */

function nextQuestion() {
  if (current < soalUjian.length - 1) {
    current++;
    renderQuestion();
  }
}

function prevQuestion() {
  if (current > 0) {
    current--;
    renderQuestion();
  }
}


/* ================= NUMBER NAV ================= */

function renderNumberNav() {

  const nav = document.getElementById("numberNav");
  if (!nav) return;

  nav.innerHTML = "";

  for (let i = 0; i < soalUjian.length; i++) {

    const btn = document.createElement("button");
    btn.innerText = i + 1;

    btn.onclick = () => {
      current = i;
      renderQuestion();
    };

    nav.appendChild(btn);
  }

  updateNumberNav();
}

function updateNumberNav() {

  const buttons = document.querySelectorAll("#numberNav button");

  buttons.forEach((btn, i) => {
    btn.classList.toggle("answered", jawaban[i] !== null);
    btn.classList.toggle("active", i === current);
  });
}


/* ================= FINISH BUTTON ================= */

function updateFinishButton(){
  const finishBtn = document.getElementById("finishBtn");
  if (!finishBtn) return;
  finishBtn.disabled = current !== soalUjian.length - 1;
}


/* ================= SUBMIT ================= */

function submitExam(auto = false) {

  if (!auto) {
    const confirmSubmit = confirm("Yakin ingin menyelesaikan ujian?");
    if (!confirmSubmit) return;
  }

  clearInterval(timerInterval);

  let score = 0;

  soalUjian.forEach((s, i) => {
    if (jawaban[i] === s.a) {
      score++;
    }
  });

  localStorage.setItem("pgScore", score);
  localStorage.setItem("pgCorrect", score);
  localStorage.setItem("reviewSoal", JSON.stringify(soalUjian));
  localStorage.setItem("reviewJawaban", JSON.stringify(jawaban));

  localStorage.removeItem("examEndTime");
  localStorage.removeItem("pgAnswers");
  localStorage.setItem("lastExamId",
  examState.mapel + "_" + examState.paket);
  window.location.href = "result.html";
}


/* ================= SHUFFLE ================= */

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}


/* ================= FULLSCREEN ================= */

function enterFullscreen() {
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch(() => {});
  }
}

document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement) {
    submitExam(true);
  }
});


/* ================= DISABLE BACK ================= */

history.pushState(null, null, location.href);
window.onpopstate = function () {
  history.go(1);
};
