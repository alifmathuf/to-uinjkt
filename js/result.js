/* ===============================
   RESULT ENGINE - FINAL STABLE
================================ */

Auth.protect();

const user = Auth.getUser();
if (!user) window.location.href = "dashboard.html";

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
  const finalScore = Math.round((correct / total) * 100);

  /* ================= TAMPILKAN NILAI PG ================= */

  document.getElementById("scoreText").innerText = finalScore;
  document.getElementById("correctCount").innerText = correct;
  document.getElementById("finalScore").innerText = finalScore;

  const statusBox = document.getElementById("statusBox");

  if (finalScore >= 75) {
    statusBox.innerHTML = `<i data-lucide="check-circle"></i> LULUS`;
    statusBox.className = "status-pass";
  } else {
    statusBox.innerHTML = `<i data-lucide="x-circle"></i> TIDAK LULUS`;
    statusBox.className = "status-fail";
  }

  if (typeof lucide !== "undefined") lucide.createIcons();

  saveToFirebaseLeaderboard(finalScore, correct, total, examKey);
  renderChart(correct, total);

  /* ================= LOAD STUDI KASUS ================= */
  loadCaseResult();

})
.catch(err => console.log("Result load error:", err));

/* ================= LOAD STUDI KASUS ================= */

function getCaseKey(key) {
  const user = Auth.getUser();
  if (!user) return key;
  return `${key}_${user.id}`;
}

function loadCaseResult(){

  const answers = JSON.parse(localStorage.getItem(getCaseKey("caseAnswers"))) || [];
  const totalWords = parseInt(localStorage.getItem(getCaseKey("caseTotalWords"))) || 0;
  const totalChars = parseInt(localStorage.getItem(getCaseKey("caseTotalChars"))) || 0;
  const topic = localStorage.getItem(getCaseKey("caseTopic")) || "-";

  // tampilkan di result
  const topicEl = document.getElementById("caseTopic");
  const wordEl = document.getElementById("caseWords");
  const charEl = document.getElementById("caseChars");

  if(topicEl) topicEl.innerText = topic;
  if(wordEl) wordEl.innerText = totalWords;
  if(charEl) charEl.innerText = totalChars;

  // simpan untuk export PDF
  const caseResult = {
    title: topic,
    deskripsi: answers[0] || "",
    upaya: answers[1] || "",
    hasil: answers[2] || "",
    hikmah: answers[3] || "",
    words: totalWords,
    chars: totalChars
  };

  localStorage.setItem("caseResult", JSON.stringify(caseResult));
}


/* ================= SAVE GLOBAL LEADERBOARD ================= */

function saveToFirebaseLeaderboard(score, correct, total, examId) {
  if (!user || !examId) return;

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
      plugins: { legend: { position: "bottom" } }
    }
  });
}

/* ================= EXPORT PDF PG ================= */

function exportPG(){
  const review = JSON.parse(localStorage.getItem("reviewData"));
  if(!review || review.length === 0){
    alert("Data tidak ditemukan");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 15;

  doc.setFontSize(16);
  doc.text("HASIL JAWABAN PILIHAN GANDA", 14, y);
  y += 10;

  doc.setFontSize(10);

  review.forEach((item, i) => {
    if(y > 270){
      doc.addPage();
      y = 15;
    }
    doc.text(`${i+1}. ${item.q}`, 14, y);
    y += 6;
    doc.text(`Jawaban Anda : ${item.user}`, 20, y);
    y += 5;
    doc.text(`Jawaban Benar: ${item.correct}`, 20, y);
    y += 5;
    doc.text(`Status : ${item.user === item.correct ? "BENAR" : "SALAH"}`, 20, y);
    y += 8;
  });

  doc.save("hasil-pg.pdf");
}
