Auth.protect();

const user = Auth.getUser();

if (!user) {
  window.location.href = "dashboard.html";
}

// Ambil ujian terakhir dari Firebase
database.ref(`exams/${user.id}`)
  .orderByChild("submittedAt")
  .limitToLast(1)
  .once("value")
  .then(snapshot => {

    if (!snapshot.exists()) {
      document.getElementById("reviewBody").innerHTML = `
        <tr>
          <td colspan="4" class="empty-state">
            Belum ada data ujian.
          </td>
        </tr>`;
      return;
    }

    // Ambil data ujian terakhir
    const examData = Object.values(snapshot.val())[0];
    const jawaban = examData.answers;
    const mapel = examData.mapel;
    const paket = examData.paket;

    // Ambil ulang soal dari file JSON
    fetch(`paket/${mapel}/${paket}.json`)
      .then(res => res.json())
      .then(soalData => {
        tampilkanReview(soalData.slice(0, jawaban.length), jawaban);
      })
      .catch(err => {
        console.error("Error loading soal:", err);
        document.getElementById("reviewBody").innerHTML = `
          <tr>
            <td colspan="4" class="empty-state">
              Gagal memuat soal.
            </td>
          </tr>`;
      });

  })
  .catch(err => {
    console.error("Error loading exam:", err);
    document.getElementById("reviewBody").innerHTML = `
      <tr>
        <td colspan="4" class="empty-state">
          Gagal memuat data ujian.
        </td>
      </tr>`;
  });


function tampilkanReview(soal, jawaban) {

  const tbody = document.getElementById("reviewBody");
  tbody.innerHTML = "";

  soal.forEach((s, i) => {

    const userAnswerIndex = jawaban[i];
    const correctIndex = s.a;

    const userAnswerText =
      userAnswerIndex !== null && userAnswerIndex !== undefined
        ? s.o[userAnswerIndex]
        : "-";

    const isCorrect = userAnswerIndex === correctIndex;

    const statusIcon = isCorrect
      ? `<span class="correct">✓</span>`
      : `<span class="wrong">✗</span>`;

    // Tampilkan soal lengkap tanpa dipotong
    const soalText = s.q;

    const row = `
      <tr>
        <td class="col-no">${i + 1}</td>
        <td class="col-soal">${soalText}</td>
        <td class="col-jawaban">${userAnswerText}</td>
        <td class="col-status">${statusIcon}</td>
      </tr>
    `;

    tbody.innerHTML += row;

  });
}
