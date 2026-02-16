Auth.protect();
const user = Auth.getUser();
const db = firebase.database();

db.ref(`exams/${user.id}`).once("value").then(snapshot => {

  if (!snapshot.exists()) return;

  const data = snapshot.val();
  const scores = [];

  Object.keys(data).forEach(key => {
    const exam = data[key];

    // ✅ jangan abaikan nilai 0
    if (exam.score == null || exam.total == null) return;
    if (exam.total == 0) return;

    const nilai = Math.round((exam.score / exam.total) * 100);
    scores.push(nilai);
  });

  // ✅ jika belum ada data
  if (scores.length === 0) {
    document.getElementById("totalExam").innerText = "0";
    document.getElementById("avgScore").innerText = "0";
    document.getElementById("maxScore").innerText = "0";
    document.getElementById("minScore").innerText = "0";
    return;
  }

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

  const ctx = document.getElementById("statChart");
  if (!ctx) return;

  new Chart(ctx, {
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
      plugins: { legend: { display:false } }
    }
  });
}
