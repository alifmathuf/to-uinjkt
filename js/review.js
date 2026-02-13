/* =================================
   REVIEW PAGE - KHUSUS PG
================================= */

const soal = JSON.parse(localStorage.getItem("reviewSoal")) || [];
const jawaban = JSON.parse(localStorage.getItem("reviewJawaban")) || [];

const tbody = document.getElementById("reviewBody");

if (!tbody) {
  console.error("Element reviewBody tidak ditemukan.");
}

if (soal.length === 0) {

  tbody.innerHTML = `
    <tr>
      <td colspan="4" style="text-align:center;">
        Data review tidak ditemukan.
      </td>
    </tr>
  `;

} else {

  soal.forEach((s, i) => {

    const userIndex = jawaban[i];
    const correctIndex = s.answer;

    const userAnswer =
      userIndex !== undefined && userIndex !== null
      ? s.options[userIndex]
      : "-";

    const status =
      userIndex === correctIndex
      ? `<span class="status-benar">Benar</span>`
      : `<span class="status-salah">Salah</span>`;

    tbody.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${s.q}</td>
        <td>${userAnswer}</td>
        <td>${status}</td>
      </tr>
    `;
  });
}
