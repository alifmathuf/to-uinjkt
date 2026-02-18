Auth.protect();

const user = Auth.getUser();
if(!user) window.location.href = "dashboard.html";

/* ================= LOAD REVIEW DARI LOCALSTORAGE ================= */

function loadReviewFromStorage() {
  
  // Coba ambil dari key umum dulu, fallback ke user-specific
  let reviewData = JSON.parse(localStorage.getItem("lastReviewData")) || 
                   JSON.parse(localStorage.getItem(`${user.id}_lastReviewData`)) || 
                   null;
  
  if (!reviewData) {
    alert("Belum ada data review. Silakan kerjakan ujian terlebih dahulu.");
    window.location.href = "dashboard.html";
    return;
  }

  const { soal, jawaban, examData } = reviewData;

  updatePageInfo(examData);
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
        
        <td class="status ${statusClass}">
          <span class="status-icon">${statusIcon}</span>
          ${statusText}
        </td>
      </tr>
    `;

    tbody.innerHTML += row;
  });

  window.currentReviewData = { soal, jawaban, examData };
  
  if (typeof lucide !== "undefined") lucide.createIcons();
}

loadReviewFromStorage();
