Auth.protect();
const user = Auth.getUser();
const db = firebase.database();

document.getElementById("userInfo").innerText =
  `${user.nama} (${user.kelas})`;

db.ref(`exams/${user.id}`)
  .once("value")
  .then(snapshot => {

    const container = document.getElementById("historyList");

    if (!snapshot.exists()) {
      container.innerHTML = "<p>Belum ada riwayat ujian.</p>";
      return;
    }

    const data = snapshot.val();
    container.innerHTML = "";

    Object.keys(data).forEach(mapel => {

      const exam = data[mapel];
      if (!exam.score || !exam.total) return;

      const nilai = Math.round((exam.score / exam.total) * 100);
      const tanggal = exam.submittedAt
        ? new Date(exam.submittedAt).toLocaleString()
        : "-";

      container.innerHTML += `
        <div class="history-card">
          <h4>${mapel}</h4>
          <p>Nilai: <b>${nilai}</b></p>
          <p>Benar: ${exam.score} / ${exam.total}</p>
          <p>Tanggal: ${tanggal}</p>
        </div>
      `;
    });

  })
  .catch(err => {
    console.log("Riwayat error:", err);
    document.getElementById("historyList").innerHTML =
      "<p>Gagal memuat data.</p>";
  });
