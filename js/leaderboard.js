document.addEventListener("DOMContentLoaded", () => {

  Auth.protect();

  const user = Auth.getUser();
  if (!user) return;

  document.getElementById("greeting").innerText = "Leaderboard";
  document.getElementById("userInfo").innerText =
    `${user.nama} (${user.kelas})`;

  const tbody = document.getElementById("leaderboardBody");

  if (typeof firebase === "undefined") {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center;">
          Firebase belum terhubung.
        </td>
      </tr>
    `;
    return;
  }

  const examId = localStorage.getItem("lastExamId");
  if (!examId) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center;">
          Belum ada ujian.
        </td>
      </tr>
    `;
    return;
  }

  const db = firebase.database();

  db.ref(`leaderboard/${examId}`)
    .once("value")
    .then(snapshot => {

      if (!snapshot.exists()) {
        tbody.innerHTML = `
          <tr>
            <td colspan="4" style="text-align:center;">
              Belum ada data.
            </td>
          </tr>
        `;
        return;
      }

      const data = snapshot.val();
      let leaderboard = [];

      Object.keys(data).forEach(userId => {

        const item = data[userId];

        leaderboard.push({
          nama: item.nama,
          kelas: item.kelas,
          score: item.score
        });

      });

      leaderboard.sort((a, b) => b.score - a.score);

      tbody.innerHTML = "";

      leaderboard.slice(0, 10).forEach((item, index) => {

        let medal =
          index === 0 ? "🥇"
          : index === 1 ? "🥈"
          : index === 2 ? "🥉"
          : index + 1;

        tbody.innerHTML += `
          <tr>
            <td class="rank-medal">${medal}</td>
            <td>${item.nama}</td>
            <td>${item.kelas}</td>
            <td>${item.score}</td>
          </tr>
        `;
      });

    })
    .catch(err => {
      console.log("Leaderboard load error:", err);
    });

});
