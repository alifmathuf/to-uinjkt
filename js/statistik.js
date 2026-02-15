Auth.protect();
const user = Auth.getUser();
const db = firebase.database();

document.getElementById("userInfo").innerText =
  `${user.nama} (${user.kelas})`;

db.ref(`exams/${user.id}`)
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

    if (scores.length === 0) return;

    const totalExam = scores.length;
    const avg = Math.round(scores.reduce((a,b)=>a+b,0) / totalExam);
    const max = Math.max(...scores);
    const min = Math.min(...scores);

    document.getElementById("totalExam").innerText = totalExam;
    document.getElementById("avgScore").innerText = avg;
    document.getElementById("maxScore").innerText = max;
    document.getElementById("minScore").innerText = min;

    renderChart(scores);

  });

function renderChart(scores){

  new Chart(document.getElementById("statChart"), {
    type: "bar",
    data: {
      labels: scores.map((_,i)=>"Ujian "+(i+1)),
      datasets: [{
        label: "Nilai",
        data: scores
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      }
    }
  });
}
