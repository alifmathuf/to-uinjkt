/* ===============================
   RESULT ENGINE - FIX PG + PDF
================================ */
function getKey(key) {
  const user = Auth.getUser();
  if (!user) return key;
  return `${key}_${user.id}`;
}

Auth.protect();

const user = Auth.getUser();
if (!user) window.location.href = "dashboard.html";

/* ================= USER INFO ================= */
document.getElementById("greeting").innerText = "Hasil Ujian";
document.getElementById("userInfo").innerText = `${user.nama} (${user.kelas})`;

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
  const scoreText = document.getElementById("scoreText");
  const correctCount = document.getElementById("correctCount");
  const finalScoreEl = document.getElementById("finalScore");
  const statusBox = document.getElementById("statusBox");

  if(scoreText) scoreText.innerText = finalScore;
  if(correctCount) correctCount.innerText = correct;
  if(finalScoreEl) finalScoreEl.innerText = finalScore;

  if(statusBox){
    if(finalScore >= 75){
      statusBox.innerHTML = `<i data-lucide="check-circle"></i> LULUS`;
      statusBox.className = "status-pass";
    } else {
      statusBox.innerHTML = `<i data-lucide="x-circle"></i> TIDAK LULUS`;
      statusBox.className = "status-fail";
    }
  }

  if(typeof lucide !== "undefined") lucide.createIcons();

  saveToFirebaseLeaderboard(finalScore, correct, total, examKey);
  renderChart(correct, total);

  loadCaseResult(); // Load PG review + studi kasus
})
.catch(err => console.log("Result load error:", err));

/* ================= LOAD CASE + REVIEW DATA ================= */
function loadCaseResult(){

  // Ambil review PG
  const review = JSON.parse(localStorage.getItem(getKey("reviewData"))) || [];

  // Tampilkan review PG di console atau element (bisa disesuaikan)
  console.log("Review PG:", review);

  // Ambil studi kasus
  const answers = JSON.parse(localStorage.getItem("caseAnswers")) || [];
  const totalWords = parseInt(localStorage.getItem("caseTotalWords")) || 0;
  const totalChars = parseInt(localStorage.getItem("caseTotalChars")) || 0;
  const topic = localStorage.getItem("caseTopic") || "-";

  const topicEl = document.getElementById("caseTopic");
  const wordEl = document.getElementById("caseWords");
  const charEl = document.getElementById("caseChars");

  if(topicEl) topicEl.innerText = topic;
  if(wordEl) wordEl.innerText = totalWords;
  if(charEl) charEl.innerText = totalChars;

  // Siapkan data export PDF
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

/* ================= SAVE LEADERBOARD ================= */
function saveToFirebaseLeaderboard(score, correct, total, examId){
  if(!user || !examId) return;
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
function renderChart(correct, total){
  const ctx = document.getElementById("scoreChart");
  if(!ctx) return;

  if(chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Benar", "Salah"],
      datasets:[{
        data:[correct, total-correct],
        backgroundColor:["#22c55e","#334155"],
        borderWidth:0
      }]
    },
    options:{ responsive:true, plugins:{legend:{position:"bottom"}} }
  });
}

/* ================= EXPORT PDF PG ================= */
function exportPG(){
  const review = JSON.parse(localStorage.getItem(getKey("reviewData")));
  if(!review || review.length === 0){
    alert("Data PG tidak ditemukan");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 15, margin = 14, pageWidth = 180;

  doc.setFont("Arial", "Normal");
  doc.setFontSize(16);
  doc.text("HASIL JAWABAN PILIHAN GANDA", margin, y); y+=10;
  doc.setFontSize(10);

  review.forEach((item,i)=>{
    if(y>270){ doc.addPage(); y=15; }

    const isBenar = item.user === item.correct;

    doc.setTextColor(0,0,0);
    let soalText = `${i+1}. ${item.q}`;
    let splitSoal = doc.splitTextToSize(soalText,pageWidth);
    doc.text(splitSoal, margin, y);
    y += splitSoal.length*5;

    if(item.options && item.options.length){
      item.options.forEach((opt,idx)=>{
        const huruf = String.fromCharCode(65+idx);
        let optText = `${huruf}. ${opt}`;
        let splitOpt = doc.splitTextToSize(optText,pageWidth-10);
        doc.text(splitOpt, margin+5, y);
        y += splitOpt.length*5;
      });
    }

    doc.setTextColor(isBenar?0:200, isBenar?128:0, 0);
    doc.text(`Jawaban Anda : ${item.user}`, margin+5, y); y+=5;

    doc.setTextColor(0,0,0);
    doc.text(`Jawaban Benar: ${item.correct}`, margin+5, y); y+=5;

    doc.setTextColor(isBenar?0:200, isBenar?128:0, 0);
    doc.text(`Status : ${isBenar?"BENAR":"SALAH"}`, margin+5, y); y+=6;

    if(item.explanation){
      doc.setTextColor(0,0,0);
      let splitExp = doc.splitTextToSize(`Pembahasan: ${item.explanation}`, pageWidth-5);
      doc.text(splitExp, margin+5, y); y+=splitExp.length*5;
    }

    y+=5;
  });

  doc.save("hasil-pg.pdf");
}
