const soal = JSON.parse(localStorage.getItem("reviewSoal")) || [];
const jawaban = JSON.parse(localStorage.getItem("reviewJawaban")) || [];

const tbody = document.getElementById("reviewBody");

if(soal.length === 0){
  tbody.innerHTML = `
    <tr>
      <td colspan="4" style="text-align:center">
        Data review tidak ditemukan
      </td>
    </tr>
  `;
}else{

  soal.forEach((s, i)=>{

    const userAnswerIndex = jawaban[i];
    const correctIndex = s.a;

    const userAnswerText =
      userAnswerIndex !== null && userAnswerIndex !== undefined
        ? s.o[userAnswerIndex]
        : "-";

    const isCorrect = userAnswerIndex === correctIndex;

    const statusIcon = isCorrect
      ? `<span class="status-true">✔ Benar</span>`
      : `<span class="status-false">✖ Salah</span>`;

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
