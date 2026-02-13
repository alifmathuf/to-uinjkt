document.addEventListener("DOMContentLoaded",()=>{

  const user = Auth.getUser();
  if(!user) return;

  document.getElementById("greeting").innerText =
    "Leaderboard";

  document.getElementById("userInfo").innerText =
    `${user.nama} (${user.kelas})`;

  const tbody = document.getElementById("leaderboardBody");

  let leaderboard =
    JSON.parse(localStorage.getItem("leaderboard")) || [];

  if(leaderboard.length===0){
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center;">
          Belum ada data.
        </td>
      </tr>
    `;
    return;
  }

  leaderboard.sort((a,b)=>b.score-a.score);

  leaderboard.slice(0,10).forEach((item,index)=>{

    let medal = index===0 ? "🥇"
              : index===1 ? "🥈"
              : index===2 ? "🥉"
              : index+1;

    tbody.innerHTML += `
      <tr>
        <td class="rank-medal">${medal}</td>
        <td>${item.nama}</td>
        <td>${item.kelas}</td>
        <td>${item.score}</td>
      </tr>
    `;
  });

});
