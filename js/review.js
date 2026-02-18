Auth.protect();

const user = Auth.getUser();

if(!user){
  window.location.href = "dashboard.html";
}

// Ambil exam key dari URL parameter
const urlParams = new URLSearchParams(window.location.search);
const examKey = urlParams.get('exam');

// Fungsi untuk load review
function loadReview(examId) {
  let query;
  
  if (examId) {
    // Load specific exam by key
    query = database.ref(`exams/${user.id}/${examId}`).once("value");
  } else {
    // Load last exam (default)
    query = database.ref(`exams/${user.id}`)
      .orderByChild("submittedAt")
      .limitToLast(1)
      .once("value");
  }

  query.then(snapshot => {
    if(!snapshot.exists()){
      alert("Belum ada data ujian.");
      window.location.href = "dashboard.html";
      return;
    }

    // Ambil data ujian
    let examData;
    if (examId) {
      examData = snapshot.val();
    } else {
      examData = Object.values(snapshot.val())[0];
    }

    // Simpan examKey untuk referensi
    const currentExamKey = examId || Object.keys(snapshot.val())[0];

    const jawaban = examData.answers || [];
    const mapel = examData.mapel;
    const paket = examData.paket;

    // Update title/page info jika ada
    updatePageInfo(examData, currentExamKey);

    // Ambil soal dari JSON
    return fetch(`paket/${mapel}/${paket}.json`)
      .then(res => res.json())
      .then(soalData => {
        tampilkanReview(soalData.slice(0, jawaban.length), jawaban, examData);
      });

  }).catch(err => {
    console.error("Error loading review:", err);
    alert("Gagal memuat data review.");
  });
}

// Update info halaman
function updatePageInfo(examData, examKey) {
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

// Load review (dengan atau tanpa parameter)
loadReview(examKey);


function tampilkanReview(soal, jawaban, examData){

  const tbody = document.getElementById("reviewBody");
  if (!tbody) return;
  
  tbody.innerHTML = "";

  soal.forEach((s, i)=>{

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

  // Simpan data untuk export PDF
  window.currentReviewData = {
    soal: soal,
    jawaban: jawaban,
    examData: examData
  };
}


function exportReviewPDF(){

  const data = window.currentReviewData;
  
  if(!data || !data.soal){
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

  soal.forEach((s, i)=>{
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
