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

  const db = firebase.database();

  // 🔥 Ambil SEMUA leaderboard semua paket
  db.ref("leaderboard")
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

      const allData = snapshot.val();
      let leaderboard = [];

      Object.keys(allData).forEach(examId => {

        const examGroup = allData[examId];

        Object.keys(examGroup).forEach(userId => {

          const item = examGroup[userId];

          leaderboard.push({
            nama: item.nama,
            kelas: item.kelas,
            score: item.score
          });

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
      console.log("Leaderboard error:", err);
    });

});
