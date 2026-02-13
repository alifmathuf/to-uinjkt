/* ===============================
   RESULT ENGINE
================================ */

const user = Auth.getUser();
const score = parseInt(localStorage.getItem("pgScore")) || 0;

document.getElementById("greeting").innerText =
  "Hasil Ujian";

document.getElementById("userInfo").innerText =
  `${user.nama} (${user.kelas})`;

document.getElementById("scoreText").innerText =
  score + " / 50";

saveToLeaderboard();
renderChart();


/* SAVE LEADERBOARD */
function saveToLeaderboard(){

  let leaderboard =
    JSON.parse(localStorage.getItem("leaderboard")) || [];

  leaderboard.push({
    nama:user.nama,
    kelas:user.kelas,
    score:score,
    date:new Date().toLocaleString()
  });

  leaderboard.sort((a,b)=>b.score-a.score);
  leaderboard = leaderboard.slice(0,10);

  localStorage.setItem("leaderboard",
    JSON.stringify(leaderboard));
}


/* CHART */
function renderChart(){

  const ctx =
    document.getElementById("scoreChart");

  new Chart(ctx,{
    type:"doughnut",
    data:{
      labels:["Benar","Salah"],
      datasets:[{
        data:[score,50-score],
        backgroundColor:[
          "#2563eb",
          "#1e293b"
        ]
      }]
    },
    options:{
      plugins:{
        legend:{
          labels:{color:"white"}
        }
      }
    }
  });
}


/* EXPORT PDF */
function exportPDF(){

  const element =
    document.getElementById("resultCard");

  html2pdf().from(element).save(
    `hasil-${user.nama}.pdf`
  );
}
