Auth.protect();

const user = Auth.getUser();

if(!user){
  window.location.href = "dashboard.html";
}

// Ambil ujian terakhir dari Firebase
database.ref(`exams/${user.id}`)
.orderByChild("submittedAt")
.limitToLast(1)
.once("value")
.then(snapshot=>{

  if(!snapshot.exists()){
    alert("Belum ada data ujian.");
    window.location.href = "dashboard.html";
    return;
  }

  // Ambil data ujian terakhir
  const examData = Object.values(snapshot.val())[0];

  const jawaban = examData.answers;
  const mapel = examData.mapel;
  const paket = examData.paket;

  // Ambil ulang soal dari file JSON
  fetch(`paket/${mapel}/${paket}.json`)
  .then(res=>res.json())
  .then(soalData=>{

    tampilkanReview(soalData.slice(0, jawaban.length), jawaban);

  });

});


function tampilkanReview(soal, jawaban){

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

function exportReviewPDF(){

  const soalList = document.querySelectorAll(".question-review");

  if(!soalList.length){
    alert("Data soal tidak ditemukan");
    return;
  }

  let html = `
    <h2 style="text-align:center">HASIL REVIEW UJIAN</h2>
    <hr>
  `;

  soalList.forEach((soal, i) => {

    const nomor = i + 1;
    const isiSoal = soal.querySelector(".question-text")?.innerText || "";
    const jawaban = soal.querySelector(".user-answer")?.innerText || "-";
    const status = soal.classList.contains("correct")
      ? "BENAR"
      : "SALAH";

    html += `
      <div style="margin-bottom:15px">
        <strong>${nomor}. ${isiSoal}</strong><br>
        Jawaban: ${jawaban}<br>
        Status: <b>${status}</b>
      </div>
    `;
  });

  html2pdf().from(html).set({
    margin: 10,
    filename: "Review_Ujian.pdf",
    html2canvas: { scale: 2 },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
  }).save();
}
