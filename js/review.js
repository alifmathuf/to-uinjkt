// Cek login
const user = firebase.auth().currentUser;

if (!user) {
  window.location.href = 'login.html';
} else {
  loadReviewData(user.uid);
}

function loadReviewData(userId) {
  const container = document.getElementById("reviewBody");
  
  database.ref(`exams/${userId}`)
    .orderByChild("submittedAt")
    .limitToLast(1)
    .once("value")
    .then(snapshot => {
      
      if (!snapshot.exists()) {
        container.innerHTML = `
          <tr>
            <td colspan="4" class="empty-cell">
              Belum ada data ujian.
            </td>
          </tr>`;
        return;
      }

      const examData = Object.values(snapshot.val())[0];
      const jawaban = examData.answers;
      const mapel = examData.mapel;
      const paket = examData.paket;

      fetch(`paket/${mapel}/${paket}.json`)
        .then(res => res.json())
        .then(soalData => {
          tampilkanReview(soalData.slice(0, jawaban.length), jawaban);
        })
        .catch(err => {
          console.error(err);
          container.innerHTML = `
            <tr>
              <td colspan="4" class="empty-cell">
                Gagal memuat soal.
              </td>
            </tr>`;
        });
    })
    .catch(err => {
      console.error(err);
      container.innerHTML = `
        <tr>
          <td colspan="4" class="empty-cell">
            Gagal memuat data.
          </td>
        </tr>`;
    });
}

function tampilkanReview(soal, jawaban) {
  const tbody = document.getElementById("reviewBody");
  tbody.innerHTML = "";

  soal.forEach((s, i) => {
    const userAnswerIndex = jawaban[i];
    const correctIndex = s.a;

    const userAnswerText = (userAnswerIndex !== null && userAnswerIndex !== undefined)
      ? s.o[userAnswerIndex]
      : "-";

    const isCorrect = userAnswerIndex === correctIndex;
    const statusIcon = isCorrect
      ? '<span class="status-benar">✓</span>'
      : '<span class="status-salah">✗</span>';

    // Tampilkan soal lengkap tanpa dipotong
    const soalText = s.q;

    const row = `
      <tr>
        <td class="cell-no">${i + 1}</td>
        <td class="cell-soal">${soalText}</td>
        <td class="cell-jawaban">${userAnswerText}</td>
        <td class="cell-status">${statusIcon}</td>
      </tr>
    `;

    tbody.innerHTML += row;
  });
}
