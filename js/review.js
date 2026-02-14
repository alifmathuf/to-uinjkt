Auth.protect();

const user = Auth.getUser();
const examId = localStorage.getItem("lastExamId");

if(!user || !examId){
  window.location.href = "dashboard.html";
}

database.ref(`exams/${user.id}/${examId}`)
.once("value")
.then(snapshot=>{

  const data = snapshot.val();
  if(!data) return;

  const jawaban = data.answers;
  const mapel = data.mapel;
  const paket = data.paket;

  // Ambil ulang soal dari file JSON
  fetch(`paket/${mapel}/${paket}.json`)
  .then(res=>res.json())
  .then(soalData=>{

      renderReview(soalData.slice(0, jawaban.length), jawaban);

  });

});
function renderReview(soal, jawaban){

  const tbody = document.getElementById("reviewBody");
  tbody.innerHTML = "";

  soal.forEach((s, i)=>{

    const userAnswerIndex = jawaban[i];
    const correctIndex = s.a;

    const userAnswerText =
      userAnswerIndex !== null && userAnswerIndex !== undefined
        ? s.o[userAnswerIndex]
        : "-";

    const isCorrect = userAnswerIndex === correctIndex;

    const statusIcon = isCorrect
      ? `<span class="correct">✔</span>`
      : `<span class="wrong">✖</span>`;

    const row = `
      <tr>
        <td>${i+1}</td>
        <td>${s.q}</td>
        <td>${userAnswerText}</td>
        <td>${statusIcon}</td>
      </tr>
    `;

    tbody.innerHTML += row;

  });

}
