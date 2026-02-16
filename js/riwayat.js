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

  const exams = Object.values(data);

  // ✅ urutkan dari terbaru
  exams.sort((a,b) => (b.submittedAt || 0) - (a.submittedAt || 0));

  exams.forEach(exam => {

    // ✅ jangan abaikan nilai 0
    if (exam.score == null || exam.total == null) return;
    if (exam.total == 0) return;

    const nilai = Math.round((exam.score / exam.total) * 100);

    const tanggal = exam.submittedAt
      ? new Date(exam.submittedAt).toLocaleString()
      : "-";

    container.innerHTML += `
      <div class="history-card">
        <h4>${exam.mapel || "Ujian"} - ${exam.paket || "-"}</h4>
        <p>Nilai: <b>${nilai}</b></p>
        <p>Benar: ${exam.score} / ${exam.total}</p>
        <p>Tanggal: ${tanggal}</p>
      </div>
    `;
  });

  // jika semua terfilter
  if(container.innerHTML === ""){
    container.innerHTML = "<p>Belum ada riwayat ujian.</p>";
  }

});
