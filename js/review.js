Auth.protect();

const user = Auth.getUser();
if(!user) window.location.href = "dashboard.html";

/* ================= LOAD REVIEW DARI LOCALSTORAGE ================= */

function loadReviewFromStorage() {
  
  // Ambil data dari localStorage (disimpan saat ujian selesai)
  const reviewData = JSON.parse(localStorage.getItem("lastReviewData")) || null;
  
  if (!reviewData) {
    alert("Belum ada data review. Silakan kerjakan ujian terlebih dahulu.");
    window.location.href = "dashboard.html";
    return;
  }

  const { soal, jawaban, examData } = reviewData;

  // Update info halaman
  updatePageInfo(examData);

  // Tampilkan review
  tampilkanReview(soal, jawaban, examData);
}

function updatePageInfo(examData) {
  const titleEl = document.getElementById("reviewTitle");
  const metaEl = document.getElementById("reviewMeta");
  
  if (titleEl) {
    titleEl.innerText = `Review: ${examData.mapel || 'Ujian'} • ${examData.paket || ''}`;
  }
  
  if (metaEl && examData.submittedAt) {
    const tanggal = new Date(examData.submittedAt).toLocaleString("id-ID");
    metaEl.innerText = `Dikerjakan: ${tanggal}`;
  }
}

function tampilkanReview(soal, jawaban, examData) {
  const tbody = document.getElementById("reviewBody");
  if (!tbody) return;
  
  tbody.innerHTML = "";

  soal.forEach((s, i) => {
    const userAnswerIndex = jawaban[i];
    const correctIndex = s.a;

    const userAnswerText =
      userAnswerIndex !== null && userAnswerIndex !== undefined
        ? s.o[userAnswerIndex]
        : "Tidak dijawab";

    const correctAnswerText = s.o[correctIndex];

    const isCorrect = userAnswerIndex === correctIndex;
    const isEmpty = userAnswerIndex === null || userAnswerIndex === undefined;

    let statusClass = isCorrect ? "correct" : (isEmpty ? "empty" : "wrong");
    let statusText = isCorrect ? "Benar" : (isEmpty ? "Kosong" : "Salah");
    let statusIcon = isCorrect ? "✓" : (isEmpty ? "−" : "✗");

    const row = `
      <tr class="${statusClass}">
        <td>${i+1}</td>
        <td class="soal-text">${s.q}</td>
        <td class="jawaban-user ${isEmpty ? 'text-muted' : ''}">${userAnswerText}</td>
        <td class="jawaban-benar">${correctAnswerText}</td>
        <td class="status ${statusClass}">
          <span class="status-icon">${statusIcon}</span>
          ${statusText}
        </td>
      </tr>
    `;

    tbody.innerHTML += row;
  });

  // Simpan untuk export PDF
  window.currentReviewData = { soal, jawaban, examData };
}

// Load saat page ready
loadReviewFromStorage();


/* ================= EXPORT PDF ================= */

function exportReviewPDF() {
  const data = window.currentReviewData;
  
  if(!data || !data.soal) {
    alert("Data review tidak tersedia");
    return;
  }

  const { soal, jawaban, examData } = data;

  let html = `
    <div style="font-family:Arial,sans-serif;padding:20px;">
      <h2 style="text-align:center;color:#1e293b;">REVIEW HASIL UJIAN</h2>
      <div style="text-align:center;margin-bottom:20px;color:#64748b;">
        ${examData.mapel || 'Ujian'} • ${examData.paket || ''}<br>
        ${examData.submittedAt ? new Date(examData.submittedAt).toLocaleString("id-ID") : ''}
      </div>
      <hr style="margin-bottom:20px;">
  `;

  soal.forEach((s, i) => {
    const userAnswerIndex = jawaban[i];
    const correctIndex = s.a;
    
    const userAnswerText = userAnswerIndex !== null && userAnswerIndex !== undefined
      ? s.o[userAnswerIndex]
      : "Tidak dijawab";
    const correctAnswerText = s.o[correctIndex];
    
    const isCorrect = userAnswerIndex === correctIndex;
    const statusColor = isCorrect ? '#16a34a' : '#dc2626';
    const statusText = isCorrect ? 'Benar' : 'Salah';

    html += `
      <div style="margin-bottom:20px;padding:15px;border:1px solid #e2e8f0;border-radius:8px;">
        <div style="font-weight:bold;margin-bottom:10px;color:#1e293b;">
          ${i+1}. ${s.q}
        </div>
        <div style="margin-left:15px;line-height:1.8;color:#475569;">
          <div>Jawaban Anda: <b style="color:${isCorrect ? '#16a34a' : '#dc2626'}">${userAnswerText}</b></div>
          <div>Kunci Jawaban: <b style="color:#16a34a">${correctAnswerText}</b></div>
          <div>Status: <b style="color:${statusColor}">${statusText}</b></div>
        </div>
      </div>
    `;
  });

  html += `</div>`;

  if (typeof html2pdf !== 'undefined') {
    html2pdf().from(html).set({
      margin: 10,
      filename: `review-${examData.mapel || 'ujian'}-${Date.now()}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { orientation: "portrait", unit: "mm", format: "a4" }
    }).save();
  } else {
    alert("Library PDF belum tersedia");
  }
}
