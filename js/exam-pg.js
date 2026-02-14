/* ===============================
   PG EXAM ENGINE - FINAL + FIREBASE
================================ */

const examState = JSON.parse(localStorage.getItem("examState"));
if (!examState) window.location.href = "dashboard.html";

const user = Auth.getUser();
if (!user) window.location.href = "login.html";

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


/* ================= SAVE ANSWER ================= */

function saveAnswer(i) {
  jawaban[current] = i;
  localStorage.setItem("pgAnswers", JSON.stringify(jawaban));
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

  /* ================= SIMPAN LOCAL ================= */

  localStorage.setItem("pgScore", score);
  localStorage.setItem("pgCorrect", score);
  localStorage.setItem("reviewSoal", JSON.stringify(soalUjian));
  localStorage.setItem("reviewJawaban", JSON.stringify(jawaban));

  localStorage.removeItem("examEndTime");
  localStorage.removeItem("pgAnswers");

  /* ================= FIREBASE UPDATE ================= */

  updateLeaderboard(score);

  window.location.href = "result.html";
}


/* ================= UPDATE LEADERBOARD ================= */

function updateLeaderboard(score){

  if (typeof firebase === "undefined") return;

  const db = firebase.database();

  const userRef = db.ref("leaderboard/" + user.id);

  userRef.once("value").then(snapshot => {

    const oldData = snapshot.val();

    // Jika belum
