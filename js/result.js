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

function exportAllPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // AMBIL DATA
  const reviewData = JSON.parse(localStorage.getItem("reviewData")) || [];
  const caseResult = JSON.parse(localStorage.getItem("caseResult")) || null;
  const hasPG = reviewData.length > 0;
  const hasCase = caseResult && caseResult.title;
  
  if (!hasPG && !hasCase) {
    alert("Belum ada jawaban untuk di-export");
    return;
  }
  
  const user = Auth.getUser();
  let startY = 20;
  
  // ================= HEADER =================
  doc.setFontSize(16);
  doc.text("HASIL UJIAN", 105, startY, { align: "center" });
  startY += 10;
  
  doc.setFontSize(10);
  doc.text(`Nama: ${user?.nama || '-'}`, 14, startY);
  doc.text(`Kelas: ${user?.kelas || '-'}`, 105, startY);
  startY += 15;
  
  // ================= BAGIAN 1: PG (TABEL) =================
  if (hasPG) {
    doc.setFontSize(12);
    doc.text("A. PILIHAN GANDA", 14, startY);
    startY += 8;
    
    // SIAPKAN DATA TABEL
    const tableData = reviewData.map((item, i) => [
      i + 1,
      item.q.substring(0, 50) + (item.q.length > 50 ? '...' : ''),
      item.user,
      item.correct,
      item.user === item.correct ? 'BENAR' : 'SALAH'
    ]);
    
    // BUAT TABEL
    doc.autoTable({
      head: [['No', 'Soal', 'Jawaban Anda', 'Kunci', 'Status']],
      body: tableData,
      startY: startY,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 70 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 20 }
      },
      didParseCell: function(data) {
        // Warna status benar/salah
        if (data.column.index === 4) {
          if (data.cell.raw === 'BENAR') {
            data.cell.styles.textColor = [34, 197, 94];
          } else {
            data.cell.styles.textColor = [239, 68, 68];
          }
        }
      }
    });
    
    startY = doc.lastAutoTable.finalY + 15;
  }
  
  // ================= BAGIAN 2: STUDI KASUS (TABEL) =================
  if (hasCase) {
    // Cek perlu halaman baru?
    if (startY > 220) {
      doc.addPage();
      startY = 20;
    }
    
    doc.setFontSize(12);
    doc.text("B. STUDI KASUS", 14, startY);
    startY += 8;
    
    // INFO KASUS
    doc.setFontSize(10);
    doc.text(`Topik: ${caseResult.title}`, 14, startY);
    doc.text(`Total Kata: ${caseResult.words}`, 100, startY);
    startY += 10;
    
    // TABEL JAWABAN
    const caseData = [
      ['1. Deskripsi Masalah', caseResult.deskripsi || '-'],
      ['2. Upaya Penyelesaian', caseResult.upaya || '-'],
      ['3. Hasil', caseResult.hasil || '-'],
      ['4. Hikmah', caseResult.hikmah || '-']
    ];
    
    doc.autoTable({
      body: caseData,
      startY: startY,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3, valign: 'top' },
      columnStyles: {
        0: { cellWidth: 50, fillColor: [240, 240, 240], fontStyle: 'bold' },
        1: { cellWidth: 130 }
      }
    });
  }
  
  // ================= FOOTER =================
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Di-export: ${new Date().toLocaleString("id-ID")} | Halaman ${i} dari ${pageCount}`,
      105,
      290,
      { align: "center" }
    );
  }
  
  // SIMPAN
  doc.save(`hasil-ujian-${user?.nama || 'user'}-${Date.now()}.pdf`);
}
