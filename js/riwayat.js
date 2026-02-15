const db = firebase.database();
const user = Auth.getUser();

db.ref(`exams/${user.id}`)
  .once("value")
  .then(snapshot => {

    if (!snapshot.exists()) {
      document.getElementById("historyList").innerHTML =
        "<p>Belum ada riwayat ujian.</p>";
      return;
    }

    const data = snapshot.val();
    const container = document.getElementById("historyList");
    container.innerHTML = "";

    Object.keys(data).forEach(mapel => {

      const exam = data[mapel];
      if (!exam.score || !exam.total) return;

      const nilai = Math.round((exam.score / exam.total) * 100);

      container.innerHTML += `
        <div class="history-card">
          <h4>${mapel}</h4>
          <p>Nilai: <b>${nilai}</b></p>
          <p>Tanggal: ${new Date(exam.submittedAt).toLocaleString()}</p>
        </div>
      `;
    });

  })
  .catch(err => {
    console.log("Riwayat error:", err);
  });
