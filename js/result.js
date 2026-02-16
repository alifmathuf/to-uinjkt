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

    /* ================= SIMPAN DATA (AMAN) ================= */

    saveExamResult(correct, total, examKey);
    saveToFirebaseLeaderboard(finalScore, correct, total, examKey);

    renderChart(correct, total);

  })
  .catch(err => {
    console.log("Result load error:", err);
  });


/* ================= SIMPAN HASIL UJIAN ================= */
/* tidak menimpa jika sudah ada */

function saveExamResult(correct, total, examKey){

  if (!user || !examKey) return;

  const ref = db.ref(`exams/${user.id}/${examKey}`);

  ref.once("value").then(snap => {

    if (snap.exists()) return; // cegah overwrite

    ref.set({
      score: correct,
      total: total,
      submittedAt: Date.now()
    });

  });
}


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

<script>
const { jsPDF } = window.jspdf;

/* ===============================
   EXPORT JAWABAN PG
================================ */
function exportPG(){

  const review = JSON.parse(localStorage.getItem("reviewData"));

  if(!review || review.length === 0){
    alert("Data tidak ditemukan");
    return;
  }

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


/* ===============================
   EXPORT STUDI KASUS
================================ */
function exportCase(){

  const caseData = JSON.parse(localStorage.getItem("caseResult"));

  if(!caseData){
    alert("Data studi kasus tidak ditemukan");
    return;
  }

  const doc = new jsPDF();
  let y = 15;

  doc.setFontSize(16);
  doc.text("HASIL STUDI KASUS", 14, y);
  y += 10;

  doc.setFontSize(12);
  doc.text(caseData.title || "Strategi Pembelajaran", 14, y);
  y += 8;

  doc.setFontSize(10);

  const sections = [
    { label:"Deskripsi", text: caseData.deskripsi },
    { label:"Upaya", text: caseData.upaya },
    { label:"Hasil", text: caseData.hasil },
    { label:"Hikmah", text: caseData.hikmah }
  ];

  sections.forEach(sec => {

    if(!sec.text) return;

    if(y > 260){
      doc.addPage();
      y = 15;
    }

    doc.setFont(undefined, 'bold');
    doc.text(sec.label, 14, y);
    y += 6;

    doc.setFont(undefined, 'normal');
    const splitText = doc.splitTextToSize(sec.text, 180);
    doc.text(splitText, 14, y);
    y += splitText.length * 6 + 4;

  });

  doc.save("hasil-studi-kasus.pdf");
}
</script>
