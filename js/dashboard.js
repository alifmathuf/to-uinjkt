/* ================= USER LOAD ================= */

const userData = JSON.parse(localStorage.getItem("cbtUser"));

if(!userData){
  window.location.href = "login.html";
}

document.getElementById("userName").innerText = userData.nama;
document.getElementById("userKelas").innerText = userData.kelas;


/* ================= MENU DATA ================= */

const menuData = [
  { title:"Latihan PG", icon:"📝", link:"exam-pg.html" },
  { title:"Studi Kasus", icon:"📚", link:"exam-case.html" },
  { title:"Leaderboard", icon:"🏆", link:"leaderboard.html" }
];


/* ================= RENDER GRID ================= */

const grid = document.getElementById("menuGrid");

menuData.forEach(item => {

  const card = document.createElement("div");
  card.classList.add("menu-card");

  card.innerHTML = `
    <div class="icon">${item.icon}</div>
    <h4>${item.title}</h4>
  `;

  card.onclick = () => {
    window.location.href = item.link;
  };

  grid.appendChild(card);

});


/* ================= LOGOUT ================= */

function logout(){
  localStorage.removeItem("cbtUser");
  window.location.href="login.html";
}
