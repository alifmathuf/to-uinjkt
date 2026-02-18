Auth.protect();

const user = Auth.getUser();
const db = firebase.database();
const container = document.getElementById("historyList");

db.ref(`exams/${user.id}`)
.once("value")
.then(snapshot => {

  if (!snapshot.exists()) {
    container.innerHTML = `
      <div style="opacity:.7;padding:20px">
        Belum ada riwayat ujian.
      </div>`;
    return;
  }

  const exams = [];
  snapshot.forEach(child => {
    exams.push({
      key: child.key,
      ...child.val()
    });
  });

  exams.sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));

  container.innerHTML = "";

  exams.forEach(exam => {
    
    if (!exam.score && exam.score !== 0) return;

    const nilai = exam.total ? Math.round((exam.score / exam.total) * 100) : 0;

    const scoreClass =
      nilai >= 75 ? "score-green" :
      nilai >= 60 ? "score-yellow" :
      "score-red";

    const badgeClass = nilai >= 75 ? "badge-lulus" : "badge-tidak";
    const badgeText = nilai >= 75 ? "LULUS" : "TIDAK";

    const tanggal = exam.submittedAt
      ? new Date(exam.submittedAt).toLocaleString("id-ID")
      : "-";

    const div = document.createElement("div");
    div.className = "history-card";
   div.innerHTML = `
  <div class="history-header">
    <div class="history-title">${exam.mapel || "Ujian"} • ${exam.paket || ""}</div>
    <div class="badge-status ${badgeClass}">${badgeText}</div>
  </div>

  <div class="history-score ${scoreClass}">${nilai}</div>
  
  <div class="history-correct">Benar: ${exam.score}/${exam.total || 0}</div>

  <div class="history-footer">
    <span class="history-date">${tanggal}</span>
    <a href="review.html?exam=${exam.key}" class="btn-review-icon" title="Review">
      <i data-lucide="eye"></i>
    </a>
  </div>
`;
    
    container.appendChild(div);
  });

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

})
.catch(err => {
  console.error(err);
  container.innerHTML = "<p>Gagal memuat riwayat.</p>";
});
