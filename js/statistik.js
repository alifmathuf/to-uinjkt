Auth.protect();
const user = Auth.getUser();
const db = firebase.database();

document.getElementById("userInfo").innerText =
  `${user.nama} (${user.kelas})`;

db.ref(`hasil_ujian/${user.id}`)
  .once("value")
  .then(snapshot => {

    if (!snapshot.exists()) return;

    const data = snapshot.val();
    const scores = [];

    Object.keys(data).forEach(mapel => {
      const exam = data[mapel];
      if (!exam.score || !exam.total) return;

      const nilai = Math.round((exam.score / exam.total) * 100);
      scores.push(nilai);
    });

    if (!scores.length) return;

    document.getElementById("totalExam").innerText = scores.length;
    document.getElementById("avgScore").innerText =
      Math.round(scores.reduce((a,b)=>a+b,0) / scores.length);
    document.getElementById("maxScore").innerText = Math.max(...scores);
    document.getElementById("minScore").innerText = Math.min(...scores);

    renderChart(scores);
  });

function renderChart(scores){
  new Chart(document.getElementById("statChart"), {
    type: "bar",
    data: {
      labels: scores.map((_,i)=>"Ujian "+(i+1)),
      datasets: [{ data: scores }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display:false } }
    }
  });
}
