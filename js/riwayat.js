Auth.protect();

const user = Auth.getUser();
const db = firebase.database();
const container = document.getElementById("historyList");

db.ref(`exams/${user.id}`)
.orderByChild("submittedAt")
.once("value")
.then(snapshot => {

  if (!snapshot.exists()) {
    container.innerHTML = `
      <div style="opacity:.7;padding:20px">
        Belum ada riwayat ujian.
      </div>`;
    return;
  }

  const data = [];
  snapshot.forEach(child => data.push(child.val()));
  data.reverse();

  container.innerHTML = "";

  data.forEach(exam => {

    if (!exam.score || !exam.total) return;

    const nilai = Math.round((exam.score / exam.total) * 100);

    const scoreClass =
      nilai >= 75 ? "score-green" :
      nilai >= 60 ? "score-yellow" :
      "score-red";

    const badgeClass =
      nilai >= 75 ? "badge-lulus" : "badge-tidak";

    const badgeText =
      nilai >= 75 ? "LULUS" : "TIDAK";

    const tanggal = exam.submittedAt
      ? new Date(exam.submittedAt).toLocaleString("id-ID")
      : "-";

    container.innerHTML += `
      <div class="history-card">

        <div class="history-title">
          ${exam.mapel || "Ujian"} • ${exam.paket || ""}
        </div>

        <div class="history-score ${scoreClass}">
          ${nilai}
        </div>

        <div class="history-meta">
          Benar: ${exam.score}/${exam.total} • ${tanggal}
        </div>

        <div class="badge-status ${badgeClass}">
          ${badgeText}
        </div>

      </div>
    `;
  });

})
.catch(err => {
  console.error(err);
  container.innerHTML = "<p>Gagal memuat riwayat.</p>";
});
