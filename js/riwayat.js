Auth.protect();
const user = Auth.getUser();
const db = firebase.database();

const container = document.getElementById("historyList");

db.ref(`exams/${user.id}`)
.once("value")
.then(snapshot => {

  if (!snapshot.exists()) {
    container.innerHTML="<p>Belum ada riwayat ujian.</p>";
    return;
  }

  const data = Object.values(snapshot.val());

  // urut terbaru di atas
  data.sort((a,b)=> (b.submittedAt||0) - (a.submittedAt||0));

  container.innerHTML="";

  data.forEach(exam => {

    if (!exam.score || !exam.total) return;

    const nilai = Math.round((exam.score/exam.total)*100);

    const warna =
      nilai>=75 ? "score-green" :
      nilai>=50 ? "score-yellow" :
      "score-red";

    const badge =
      nilai>=75
      ? `<span class="badge badge-pass">LULUS</span>`
      : `<span class="badge badge-fail">TIDAK</span>`;

    const tanggal = exam.submittedAt
      ? new Date(exam.submittedAt).toLocaleString()
      : "-";

    container.innerHTML += `
      <div class="history-card">

        <div class="history-head">
          <div class="history-title">
            ${exam.mapel || "Ujian"} - ${exam.paket || ""}
          </div>
          ${badge}
        </div>

        <div>Nilai:
          <span class="${warna}">${nilai}</span>
        </div>

        <div class="history-meta">
          Benar: ${exam.score} / ${exam.total}
        </div>

        <div class="history-meta">
          ${tanggal}
        </div>

      </div>
    `;
  });

});
