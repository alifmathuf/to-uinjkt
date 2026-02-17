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

function loadCaseResult(){

  const answers = JSON.parse(localStorage.getItem("caseAnswers")) || [];
  const totalWords = parseInt(localStorage.getItem("caseTotalWords")) || 0;
const totalChars = parseInt(localStorage.getItem("caseTotalChars")) || 0;
  const topic = localStorage.getItem("caseTopic") || "-";

  // tampilkan di result
  const topicEl = document.getElementById("caseTopic");
  const wordEl = document.getElementById("caseWords");
  const charEl = document.getElementById("caseChars");

  if(topicEl) topicEl.innerText = topic;
  if(wordEl) wordEl.innerText = totalWords;
  if(charEl) charEl.innerText = totalChars;

  // siapkan data export PDF
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
      plugins: {
        legend: { position: "bottom" }
      }
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
  const margin = 14;
  const pageWidth = 180;

  doc.setFont("Arial", "Normal");

  // ================= TITLE =================
  doc.setFontSize(16);
  doc.text("HASIL JAWABAN PILIHAN GANDA", margin, y);
  y += 10;

  doc.setFontSize(10);

  review.forEach((item, i) => {

  // auto page break
  if (y > 270) {
    doc.addPage();
    y = 15;
  }

  const isBenar = item.user === item.correct;

  // ================= SOAL =================
  doc.setTextColor(0,0,0);
  let soalText = `${i+1}. ${item.q}`;
  let splitSoal = doc.splitTextToSize(soalText, pageWidth);

  doc.text(splitSoal, margin, y);
  y += splitSoal.length * 5;

  // ================= OPSI =================
  if(item.options && item.options.length){
    item.options.forEach((opt, idx) => {
      const huruf = String.fromCharCode(65 + idx);
      let optText = `${huruf}. ${opt}`;
      let splitOpt = doc.splitTextToSize(optText, pageWidth - 10);

      doc.text(splitOpt, margin + 5, y);
      y += splitOpt.length * 5;
    });
  }

  // ================= JAWABAN USER =================
  if (isBenar) {
    doc.setTextColor(0, 128, 0); // hijau
  } else {
    doc.setTextColor(200, 0, 0); // merah
  }

  doc.text(`Jawaban Anda : ${item.user}`, margin + 5, y);
  y += 5;

  // ================= JAWABAN BENAR =================
  doc.setTextColor(0,0,0);
  doc.text(`Jawaban Benar: ${item.correct}`, margin + 5, y);
  y += 5;

  // ================= STATUS =================
  if (isBenar) {
    doc.setTextColor(0, 128, 0);
  } else {
    doc.setTextColor(200, 0, 0);
  }

  const status = isBenar ? "BENAR" : "SALAH";
  doc.text(`Status : ${status}`, margin + 5, y);
  y += 6;

  // ================= PEMBAHASAN =================
  doc.setTextColor(0,0,0);
  if(item.explanation){
    let splitExp = doc.splitTextToSize(
      `Pembahasan: ${item.explanation}`,
      pageWidth - 5
    );
    doc.text(splitExp, margin + 5, y);
    y += splitExp.length * 5;
  }

  // jarak antar soal
  y += 5;

});

doc.save("hasil-pg.pdf");
