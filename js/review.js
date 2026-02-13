const soal = JSON.parse(localStorage.getItem("pgSoal"));
const jawaban = JSON.parse(localStorage.getItem("pgAnswers"));

if(!soal || !jawaban){
  document.getElementById("reviewTable").innerHTML =
    "<p>Data tidak ditemukan.</p>";
}else{

  let html = "";

  soal.forEach((s,i)=>{

    const benar = jawaban[i] === s.a;

    html += `
      <div class="review-card">
        <div class="review-number">
          Soal ${i+1}
        </div>

        <div class="review-question">
          ${s.q}
        </div>

        <div class="review-answer">
          Jawaban Anda: 
          ${jawaban[i] !== null ? s.o[jawaban[i]] : "-"}
        </div>

        <div class="${benar ? 'correct' : 'wrong'}">
          ${benar ? 'Benar' : 'Salah'}
        </div>
      </div>
    `;
  });

  document.getElementById("reviewTable").innerHTML = html;
}
