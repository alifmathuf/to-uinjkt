Auth.protect();
const user = Auth.getUser();
const db = firebase.database();

const container = document.getElementById("historyList");

db.ref(`exams/${user.id}`).once("value").then(snapshot => {

  if (!snapshot.exists()) {
    container.innerHTML = "<p>Belum ada riwayat ujian.</p>";
    return;
  }

  const data = snapshot.val();
  container.innerHTML = "";

  Object.keys(data).forEach(key => {
    const exam = data[key];

    if (!exam.score || !exam.total) return;

    const nilai = Math.round((exam.score / exam.total) * 100);

    const tanggal = exam.submittedAt
      ? new Date(exam.submittedAt).toLocaleString()
      : "-";

    container.innerHTML += `
      <div class="history-card">
        <h4>${exam.mapel} - ${exam.paket}</h4>
        <p>Nilai: <b>${nilai}</b></p>
        <p>Benar: ${exam.score} / ${exam.total}</p>
        <p>Tanggal: ${tanggal}</p>
      </div>
    `;
  });

});
