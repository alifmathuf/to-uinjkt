Auth.protect();
const user = Auth.getUser();
const db = firebase.database();

const container = document.getElementById("historyList");

db.ref(`exams/${user.id}`)
.orderByChild("submittedAt")
.once("value")
.then(snapshot => {

  if (!snapshot.exists()) {
    container.innerHTML = "<p>Belum ada riwayat ujian.</p>";
    return;
  }

  const data = [];
  snapshot.forEach(child => data.push(child.val()));
  data.reverse();

  container.innerHTML = "";

  data.forEach(exam => {

    if (!exam.score || !exam.total) return;

    const nilai = Math.round((exam.score/exam.total)*100);

    const scoreClass =
      nilai >= 75 ? "score-green" :
      nilai >= 60 ? "score-yellow" :
      "score-red";

    const badge =
      nilai >= 75
        ? '<span class="badge badge-pass">LULUS</span>'
        : '<span class="badge badge-fail">TIDAK</span>';

    const tanggal = exam.submittedAt
      ? new Date(exam.submittedAt).toLocaleString()
      : "-";

    container.innerHTML += `
      <div class="history-card">
        <div class="history-head">
          <div class="history-title">${exam.mapel} • ${exam.paket}</div>
          ${badge}
        </div>

        <p>Nilai:
          <span class="${scoreClass}">${nilai}</span>
        </p>

        <div class="history-meta">
          Benar: ${exam.score}/${exam.total} • ${tanggal}
        </div>
      </div>
    `;
  });

});
