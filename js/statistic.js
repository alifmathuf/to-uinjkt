const user = Auth.getUser();
const db = firebase.database();

let scoreChart;
let mapelChart;

db.ref("exams/" + user.id).on("value", snap => {

  const scores = [];

  snap.forEach(child => {
    const d = child.val();
    scores.push({
      mapel: d.mapel,
      score: Math.round((d.score / d.total) * 100)
    });
  });

  renderCharts(scores);
});

function renderCharts(scores){

  // destroy chart lama supaya tidak dobel
  if(scoreChart) scoreChart.destroy();
  if(mapelChart) mapelChart.destroy();

  scoreChart = new Chart(document.getElementById("scoreChart"), {
    type: "line",
    data: {
      labels: scores.map((_,i)=>"Ujian "+(i+1)),
      datasets: [{
        label: "Nilai (%)",
        data: scores.map(s=>s.score),
        tension:0.3
      }]
    }
  });

  const mapelCount = {};
  scores.forEach(s=>{
    mapelCount[s.mapel]=(mapelCount[s.mapel]||0)+1;
  });

  mapelChart = new Chart(document.getElementById("mapelChart"), {
    type: "doughnut",
    data: {
      labels:Object.keys(mapelCount),
      datasets:[{
        data:Object.values(mapelCount)
      }]
    }
  });
}
