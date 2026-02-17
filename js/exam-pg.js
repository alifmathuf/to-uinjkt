/* ===============================
   PG EXAM ENGINE - STABLE FIREBASE VERSION
   CLEAN PREMIUM FIXED
================================ */
function getKey(key) {
  const user = Auth.getUser();
  if (!user) return key;
  return `${key}_${user.id}`;
}
const examState = JSON.parse(localStorage.getItem("examState"));
if (!localStorage.getItem(getKey("pgAnswers"))) {
  localStorage.removeItem(getKey("examEndTime"));
}
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

    const savedAnswers = localStorage.getItem(getKey("pgAnswers"));
    jawaban = savedAnswers
      ? JSON.parse(savedAnswers)
      : new Array(soalUjian.length).fill(null);

    startTimer();
    renderNumberNav();
    renderQuestion();

  })
  .catch(err => {
    console.error(err);
    alert("Soal gagal dimuat.");
  });


/* ================= TIMER ================= */

function startTimer() {

  const savedEnd = localStorage.getItem(getKey("examEndTime"));
  if (savedEnd) {
    endTime = parseInt(savedEnd);
  } else {
    endTime = Date.now() + duration * 1000;
    localStorage.setItem(getKey("examEndTime"), endTime);
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

      if (remaining <= 300) timerEl.classList.add("warning");
      if (remaining <= 60) {
        timerEl.classList.remove("warning");
        timerEl.classList.add("danger");
      }
    }

  }, 1000);
}


/* ================= RENDER ================= */

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

  if (progressText)
    progressText.innerText = `Soal ${current + 1} dari ${total}`;

  if (progressFill)
    progressFill.style.width = percent + "%";
}


/* ================= SAVE ANSWER ================= */

function saveAnswer(i) {

  jawaban[current] = i;
  localStorage.setItem(getKey("pgAnswers"), JSON.stringify(jawaban));

  const user = Auth.getUser();
  if (!user || typeof firebase === "undefined") return;

  const examId = examState.mapel + "_" + examState.paket;
  const db = firebase.database();

  db.ref(`exams/${user.id}/${examId}/answers`)
    .set(jawaban)
    .catch(err => console.log("Realtime save error:", err));

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
  const btn = document.getElementById("finishBtn");
  if (!btn) return;
  btn.disabled = current !== soalUjian.length - 1;
}


/* ================= SUBMIT ================= */

async function submitExam(auto = false) {

  if (!auto) {
    if (!confirm("Yakin ingin menyelesaikan ujian?")) return;
  }

  clearInterval(timerInterval);

  let score = 0;
  soalUjian.forEach((s, i) => {
    if (jawaban[i] === s.a) score++;
  });

  const user = Auth.getUser();
  const examId = examState.mapel + "_" + examState.paket;

  try {

    if (user && typeof firebase !== "undefined") {

      const db = firebase.database();

      await db.ref(`exams/${user.id}/${examId}`).set({
        userId: user.id,
        nama: user.nama,
        kelas: user.kelas,
        mapel: examState.mapel,
        paket: examState.paket,
        answers: jawaban,
        score: score,
        total: soalUjian.length,
        submittedAt: Date.now(),
        status: "finished"
      });

      await db.ref(`leaderboard/${examId}/${user.id}`).set({
        nama: user.nama,
        kelas: user.kelas,
        score: score,
        total: soalUjian.length,
        submittedAt: Date.now()
      });

      localStorage.setItem("lastExamId", examId);
    }

  } catch (err) {
    console.log("Firebase submit error:", err);
  }

  localStorage.setItem("pgScore", score);
  localStorage.setItem("reviewSoal", JSON.stringify(soalUjian));
  localStorage.setItem("reviewJawaban", JSON.stringify(jawaban));
 
   // ================= BUILD REVIEW DATA =================
let reviewData = [];

soalUjian.forEach((s, i) => {

  reviewData.push({
    q: s.q,
    options: s.o,          // opsi jawaban
    user: jawaban[i] !== null 
      ? String.fromCharCode(65 + jawaban[i]) 
      : "-",
    correct: String.fromCharCode(65 + s.a),
    explanation: s.pembahasan || ""
  });

});

// simpan untuk halaman result
localStorage.setItem("reviewData", JSON.stringify(reviewData));

  localStorage.removeItem(getKey("examEndTime"));
localStorage.removeItem(getKey("pgAnswers"));

  window.location.href = "result.html";
}


/* ================= SHUFFLE ================= */

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}


/* ================= FULLSCREEN ================= */

document.addEventListener("fullscreenchange", () => {
 if (!document.fullscreenElement) {
  alert("Fullscreen keluar!");
}
});


/* ================= DISABLE BACK ================= */

history.pushState(null, null, location.href);
window.onpopstate = function () {
  history.go(1);
};
