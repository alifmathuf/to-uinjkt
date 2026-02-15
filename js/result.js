/* ===============================
   RESULT ENGINE - CLEAN STABLE
================================ */

Auth.protect();

const user = Auth.getUser();
if (!user) {
  window.location.href = "dashboard.html";
}

/* ================= USER INFO ================= */

document.getElementById("greeting").innerText = "Hasil Ujian";
document.getElementById("userInfo").innerText =
  `${user.nama} (${user.kelas})`;


/* ================= AMBIL DATA TERAKHIR ================= */

const db = firebase.database();

db.ref(`exams/${user.id}`)
  .orderByChild("submittedAt")
  .limitToLast(1)
  .once("value")
  .then(snapshot => {

    if (!snapshot.exists()) {
      alert("Belum ada hasil ujian.");
      window.location.href = "dashboard.html";
      return;
    }

    const examData = Object.values(snapshot.val())[0];

    const correct = examData.score || 0;
    const total = examData.total || 50;
    const finalScore = Math.round((correct / total) * 100);

    /* ================= TAMPILKAN NILAI ================= */

    document.getElementById("scoreText").innerText = finalScore;
    document.getElementById("correctCount").innerText = correct;
    document.getElementById("finalScore").innerText = finalScore;

    const statusBox = document.getElementById("statusBox");

    if (finalScore >= 75) {
      statusBox.innerHTML =
        `<i data-lucide="check-circle"></i> LULUS`;
      statusBox.className = "status-pass";
    } else {
      statusBox.innerHTML =
        `<i data-lucide="x-circle"></i> TIDAK LULUS`;
      statusBox.className = "status-fail";
    }

    lucide.createIcons();

    /* ================= SAVE LEADERBOARD ================= */

    saveToFirebaseLeaderboard(
      finalScore,
      correct,
      total
    );

    renderChart(correct, total);

  })
  .catch(err => {
    console.log("Result load error:", err);
  });


/* ================= SAVE GLOBAL LEADERBOARD ================= */

function saveToFirebaseLeaderboard(score, correct, total) {

  if (!user || typeof firebase === "undefined") return;

  const examId = localStorage.getItem("lastExamId");
  if (!examId) return;

  db.ref(`leaderboard/${examId}/${user.id}`).set({
    nama: user.nama,
    kelas: user.kelas,
    score: score,
    correct: correct,
    total: total,
    updatedAt: Date.now()
  });
}

function generateAvatar(){

  const user = Auth.getUser();
  if(!user || !user.nama) return;

  const name = user.nama.trim();
  const firstLetter = name.charAt(0).toUpperCase();

  const avatar = document.getElementById("avatar");
  if(!avatar) return;

  avatar.innerText = firstLetter;

  // generate warna konsisten dari nama
  const colors = [
    "#2563eb",
    "#0ea5e9",
    "#14b8a6",
    "#8b5cf6",
    "#f59e0b",
    "#ef4444"
  ];

  const index = name.charCodeAt(0) % colors.length;

  avatar.style.background = colors[index];
}

generateAvatar();
/* ================= CHART ================= */

let chartInstance;

function renderChart(correct, total) {

  const ctx = document.getElementById("scoreChart");
  if (!ctx) return;

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Benar", "Salah"],
      datasets: [{
        data: [correct, total - correct],
        backgroundColor: ["#22c55e", "#334155"],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" }
      }
    }
  });
}
function downloadPDF(){

  const element = document.getElementById("resultSheet");

  const opt = {
    margin:       10,
    filename:     'hasil-ujian.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
}
