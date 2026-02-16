function renderChart(scores){

  const ctx = document.getElementById("statChart");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: scores.map((_,i)=>"Ujian "+(i+1)),
      datasets: [{
        data: scores,
        backgroundColor: "#22c55e",
        borderRadius: 6
      }]
    },
    options: {
      responsive:true,
      maintainAspectRatio:false,
      plugins:{ legend:{ display:false }},
      scales:{
        y:{ beginAtZero:true, max:100 }
      }
    }
  });
}
