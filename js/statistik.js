Auth.protect();
const user = Auth.getUser();
const db = firebase.database();

db.ref(`exams/${user.id}`)
.once("value")
.then(snapshot => {

  if (!snapshot.exists()) return;

  const data = snapshot.val();
  const scores = [];

  Object.values(data).forEach(exam => {
    if (!exam.score || !exam.total) return;

    const nilai = Math.round((exam.score / exam.total) * 100);
    scores.push(nilai);
  });

  if (!scores.length) return;

  const totalExam = scores.length;
  const avg = Math.round(scores.reduce((a,b)=>a+b,0)/totalExam);
  const max = Math.max(...scores);
  const min = Math.min(...scores);

  setScore("totalExam", totalExam);
  setScore("avgScore", avg);
  setScore("maxScore", max);
  setScore("minScore", min);

  const statusBadge = avg >= 70
  ? '<span class="badge badge-pass">LULUS</span>'
  : '<span class="badge badge-fail">TIDAK</span>';

document.getElementById("statusBadge").innerHTML = statusBadge;

  renderChart(scores);
});

function setScore(id,val){
  const el = document.getElementById(id);
  el.innerText = val;

  if(val >= 75) el.className="score-green";
  else if(val >= 50) el.className="score-yellow";
  else el.className="score-red";
}

function renderChart(scores){
  new Chart(document.getElementById("statChart"), {
    type: "bar",
    data: {
      labels: scores.map((_,i)=>"Ujian "+(i+1)),
      datasets: [{
        data: scores,
        borderRadius:8,
        borderSkipped:false
      }]
    },
    options: {
      responsive:true,
      plugins:{ legend:{ display:false }},
      scales:{
        y:{ beginAtZero:true, max:100, ticks:{ stepSize:20 } }
      }
    }
  });
}
