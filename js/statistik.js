const user = Auth.getUser();

if (!user) {
  console.error("User tidak ditemukan");
}

const db = firebase.database();

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

function renderCharts(scores) {

  if (!scores.length) {
    console.log("Belum ada data ujian");
    return;
  }

  const ctx1 = document.getElementById("scoreChart");
  const ctx2 = document.getElementById("mapelChart");

  new Chart(ctx1, {
    type: "line",
    data: {
      labels: scores.map((_, i) => "Ujian " + (i + 1)),
      datasets: [{
        label: "Nilai (%)",
        data: scores.map(s => s.score),
        tension: 0.3
      }]
    }
  });

  const mapelCount = {};

  scores.forEach(s => {
    mapelCount[s.mapel] = (mapelCount[s.mapel] || 0) + 1;
  });

  new Chart(ctx2, {
    type: "doughnut",
    data: {
      labels: Object.keys(mapelCount),
      datasets: [{
        data: Object.values(mapelCount)
      }]
    }
  });

}
