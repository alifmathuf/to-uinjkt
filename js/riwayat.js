Auth.protect();

const user = Auth.getUser();
const list = document.getElementById("historyList");

// userId pada database = username_kelas
const userId = user.username + "_" + user.kelas;

database.ref("exams/" + userId)
.once("value", snap => {

  if(!snap.exists()){
    list.innerHTML = "<p>Belum ada riwayat ujian</p>";
    return;
  }

  let data = [];

  snap.forEach(paket => {
    const r = paket.val();

    if(r.status === "finished"){
      data.push(r);
    }
  });

  // urut terbaru
  data.sort((a,b)=> b.submittedAt - a.submittedAt);

  data.forEach(r => {

    const div = document.createElement("div");
    div.className = "history-item";

    const date = new Date(r.submittedAt).toLocaleDateString("id-ID");

    div.innerHTML = `
      <div>
        <strong>${r.mapel}</strong><br>
        <span class="history-meta">
          ${r.paket} • ${date}
        </span>
      </div>

      <div class="history-score">
        ${r.score}
      </div>
    `;

    list.appendChild(div);
  });

});
