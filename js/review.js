document.addEventListener("DOMContentLoaded",()=>{

  const examState = JSON.parse(localStorage.getItem("examState"));
  const answers = JSON.parse(localStorage.getItem("pgAnswers"));

  if(!examState || !answers){
    document.getElementById("reviewContainer").innerHTML=
      "<p>Tidak ada data ujian.</p>";
    return;
  }

  fetch(`./paket/${examState.paket}.json`)
  .then(res=>res.json())
  .then(data=>{

    const soal = data.slice(0,50);
    const container =
      document.getElementById("reviewContainer");

    soal.forEach((q,index)=>{

      const card=document.createElement("div");
      card.className="review-card";

      let optionsHTML="";

      q.options.forEach((opt,i)=>{

        let className="option";

        if(i===q.answer){
          className+=" correct";
        }

        if(answers[index]===i && i!==q.answer){
          className+=" wrong";
        }

        optionsHTML+=
          `<div class="${className}">
            ${opt}
          </div>`;
      });

      card.innerHTML=`
        <h4>Soal ${index+1}</h4>
        <p>${q.q}</p>
        ${optionsHTML}
      `;

      container.appendChild(card);
    });

  });

});
