const user = Auth.getUser();
const db = firebase.database();

const list = document.getElementById("historyList");

db.ref("exams/" + user.id).once("value", snap => {

  snap.forEach(child => {

    const d = child.val();

    const el = document.createElement("div");
    el.className="card";

    el.innerHTML = `
      <b>${d.mapel}</b> - Paket ${d.paket}<br>
      Nilai: ${d.score}/${d.total}<br>
      <small>${new Date(d.submittedAt).toLocaleString()}</small>
    `;

    list.appendChild(el);

  });

});
