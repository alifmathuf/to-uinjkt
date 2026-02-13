/* ===============================
   RESULT ENGINE - FINAL CLEAN
================================ */

Auth.protect();

const user = Auth.getUser();

const correct = parseInt(localStorage.getItem("pgScore")) || 0;
const total = 50;
const finalScore = Math.round((correct / total) * 100);

const totalWords =
  parseInt(localStorage.getItem("caseTotalWords")) || 0;

const totalChars =
  parseInt(localStorage.getItem("caseTotalChars")) || 0;


/* ================= USER INFO ================= */

document.getElementById("greeting").innerText =
  "Hasil Ujian";

document.getElementById("userInfo").innerText =
  `${user.nama} (${user.kelas})`;


/* ================= PG RESULT ================= */

document.getElementById("scoreText").innerText =
  finalScore;

document.getElementById("correctCount").innerText =
  correct;

document.getElementById("finalScore").innerText =
  finalScore;


/* ================= STATUS ================= */

const statusBox =
  document.getElementById("statusBox");

if(finalScore >= 75){
  statusBox.innerHTML =
    `<i data-lucide="check-circle"></i> LULUS`;
  statusBox.className = "status-pass";
}else{
  statusBox.innerHTML =
    `<i data-lucide="x-circle"></i> TIDAK LULUS`;
  statusBox.className = "status-fail";
}


/* ================= STUDI KASUS ================= */

document.getElementById("totalWords").innerText =
  totalWords;

document.getElementById("totalChars").innerText =
  totalChars;


/* ================= SAVE LEADERBOARD ================= */

saveToLeaderboard();


function saveToLeaderboard(){

  let leaderboard =
    JSON.parse(localStorage.getItem("leaderboard")) || [];

  leaderboard.push({
    nama:user.nama,
    kelas:user.kelas,
    score:finalScore,
    date:new Date().toLocaleString()
  });

  leaderboard.sort((a,b)=>b.score-a.score);
  leaderboard = leaderboard.slice(0,10);

  localStorage.setItem(
    "leaderboard",
    JSON.stringify(leaderboard)
  );
}


/* ================= CHART ================= */

let chartInstance;

function renderChart(){

  const ctx =
    document.getElementById("scoreChart");

  if(chartInstance){
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx,{
    type:"doughnut",
    data:{
      labels:["Benar","Salah"],
      datasets:[{
        data:[correct, total-correct],
        backgroundColor:[
          "#22c55e",
          "#334155"
        ],
        borderWidth:0
      }]
    },
    options:{
      responsive:true,
      plugins:{
        legend:{
          position:"bottom"
        }
      }
    }
  });
}


/* ================= EXPORT PDF ================= */

function exportPDF(){

  const element =
    document.getElementById("resultCard");

  html2pdf().from(element).save(
    `hasil-${user.nama}.pdf`
  );
}


/* ================= INIT ================= */

renderChart();
lucide.createIcons();
