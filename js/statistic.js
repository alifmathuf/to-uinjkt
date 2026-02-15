const user = Auth.getUser();
const db = firebase.database();

const scores = [];

db.ref("exams/" + user.id).once("value", snap => {

  snap.forEach(child => {
    const d = child.val();
    scores.push({
      mapel: d.mapel,
      score: Math.round((d.score / d.total) * 100)
    });
  });

  renderCharts();
});

function renderCharts(){

  const ctx = document.getElementById("scoreChart");

  new Chart(ctx, {
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

  new Chart(document.getElementById("mapelChart"), {
    type: "doughnut",
    data: {
      labels:Object.keys(mapelCount),
      datasets:[{
        data:Object.values(mapelCount)
      }]
    }
  });

}
