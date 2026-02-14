document.addEventListener("DOMContentLoaded",()=>{

  Auth.protect();

  const user = Auth.getUser();
  if(!user) return;

  document.getElementById("greeting").innerText =
    "Leaderboard";

  document.getElementById("userInfo").innerText =
    `${user.nama} (${user.kelas})`;

  const tbody = document.getElementById("leaderboardBody");

  if(typeof firebase === "undefined"){
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center;">
          Firebase belum terhubung.
        </td>
      </tr>
    `;
    return;
  }

  // 🔥 AMBIL DATA DARI FIREBASE
  database.ref("exams")
.once("value")
.then(snapshot=>{

  const allUsers = snapshot.val();

  if(!allUsers){
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center;">
          Belum ada data.
        </td>
      </tr>
    `;
    return;
  }

  let leaderboard = [];

  // Loop semua user
  Object.keys(allUsers).forEach(userId => {

    const userExams = allUsers[userId];

    Object.keys(userExams).forEach(examId => {

      const exam = userExams[examId];

      if(exam.status === "finished"){

        leaderboard.push({
          nama: exam.nama || "-",   // fallback
          kelas: exam.kelas || "-",
          score: Math.round((exam.correct / exam.total) * 100)
        });

      }

    });

  });

  // Urutkan skor tertinggi
  leaderboard.sort((a,b)=>b.score - a.score);

  tbody.innerHTML = "";

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
