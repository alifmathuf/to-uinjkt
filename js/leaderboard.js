document.addEventListener("DOMContentLoaded", () => {

  const tbody = document.getElementById("leaderboardBody");

  if (!tbody) return;

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

  firebase.database()
    .ref("leaderboard")
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

      const allMapel = snapshot.val();
      let leaderboard = [];

      Object.keys(allMapel).forEach(mapel => {
        const users = allMapel[mapel];

        Object.keys(users).forEach(userId => {
          const item = users[userId];

          leaderboard.push({
            nama: item.nama || "-",
            kelas: item.kelas || "-",
            score: item.score || 0
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
            <td>${medal}</td>
            <td>${item.nama}</td>
            <td>${item.kelas}</td>
            <td>${item.score}</td>
          </tr>
        `;
      });

    })
    .catch(err => {
      console.log("Leaderboard error:", err);
      tbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align:center;">
            Error mengambil data.
          </td>
        </tr>
      `;
    });

});


function generateAvatar(){

  const user = Auth.getUser();
  if(!user || !user.nama) return;

  const name = user.nama.trim();
  const firstLetter = name.charAt(0).toUpperCase();

  const avatar = document.getElementById("avatar");
  if(!avatar) return;

  avatar.innerText = firstLetter;

  // generate warna konsisten dari nama
  const colors = [
    "#2563eb",
    "#0ea5e9",
    "#14b8a6",
    "#8b5cf6",
    "#f59e0b",
    "#ef4444"
  ];

  const index = name.charCodeAt(0) % colors.length;

  avatar.style.background = colors[index];
}

generateAvatar();
