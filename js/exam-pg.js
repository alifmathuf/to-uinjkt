/* ===============================
   PG EXAM ENGINE - FINAL CLEAN
================================ */

const examState = JSON.parse(localStorage.getItem("examState"));
if (!examState) window.location.href = "dashboard.html";

let soalData = [];
let soalUjian = [];
let jawaban = [];
let current = 0;
let duration = 120 * 60; // 120 menit
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
    renderQuestion();
    renderNumberNav();
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
      submitExam();
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

  document.getElementById("examInfo").innerText =
    `${examState.mapel.toUpperCase()} | ${examState.paket}`;

  document.getElementById("questionBox").innerHTML = `
    <h3>Soal ${current + 1}</h3>
    <p>${q.q}</p>
    ${q.o.map((opt, i) => `
      <label style="display:block;margin:8px 0;cursor:pointer;">
        <input type="radio" name="jawab"
        ${jawaban[current] === i ? "checked" : ""}
        onchange="saveAnswer(${i})">
        ${opt}
      </label>
    `).join("")}
  `;

  updateNumberNav();
}
const finishBtn = document.getElementById("finishBtn");

if(current === soalUjian.length - 1){
  finishBtn.disabled = false;
}else{
  finishBtn.disabled = true;
}

/* ================= SAVE ANSWER ================= */

function saveAnswer(i) {
  jawaban[current] = i;
  localStorage.setItem("pgAnswers", JSON.stringify(jawaban));
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
}

function updateNumberNav() {
  const buttons = document.querySelectorAll("#numberNav button");

  buttons.forEach((btn, i) => {
    btn.classList.toggle("answered", jawaban[i] !== null);
  });
}


/* ================= SUBMIT ================= */

function submitExam() {

  let score = 0;

  soalUjian.forEach((s, i) => {
    if (jawaban[i] === s.a) { // pakai properti JSON "a"
      score++;
    }
  });

  /* ===== SIMPAN UNTUK RESULT ===== */
  localStorage.setItem("pgScore", score);

  /* ===== SIMPAN UNTUK REVIEW ===== */
  localStorage.setItem("reviewSoal", JSON.stringify(soalUjian));
  localStorage.setItem("reviewJawaban", JSON.stringify(jawaban));

  /* ===== CLEAN TIMER ===== */
  localStorage.removeItem("examEndTime");
  localStorage.removeItem("pgAnswers");

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
    submitExam();
  }
});


/* ================= DISABLE BACK ================= */

history.pushState(null, null, location.href);
window.onpopstate = function () {
  history.go(1);
};
