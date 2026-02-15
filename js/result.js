/* ===============================
   RESULT ENGINE - FINAL STABLE
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

const db = firebase.database();

/* ================= AMBIL UJIAN TERAKHIR ================= */

db.ref(`exams/${user.id}`)
  .limitToLast(1)
  .once("value")
  .then(snapshot => {

    if (!snapshot.exists()) {
      alert("Belum ada hasil ujian.");
      window.location.href = "dashboard.html";
      return;
    }

    const examKey = Object.keys(snapshot.val())[0];
    const examData = snapshot.val()[examKey];

    const correct = examData.score || 0;
    const total = examData.total || 0;

    if (!total) {
      alert("Data nilai belum tersedia.");
      window.location.href = "dashboard.html";
      return;
    }

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

    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }

    /* ================= SAVE LEADERBOARD ================= */

    saveToFirebaseLeaderboard(
      finalScore,
      correct,
      total,
      examKey
    );

    renderChart(correct, total);

  })
  .catch(err => {
    console.log("Result load error:", err);
  });


/* ================= SAVE GLOBAL LEADERBOARD ================= */

function saveToFirebaseLeaderboard(score, correct, total, examId) {

  if (!user || typeof firebase === "undefined") return;
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


/* ================= DOWNLOAD PDF ================= */

function downloadPDF(){

  const element = document.getElementById("resultSheet");

  const opt = {
    margin: 10,
    filename: 'hasil-ujian.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
}
