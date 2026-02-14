document.addEventListener("DOMContentLoaded", function(){

/* ================= USER LOAD ================= */

const userData = JSON.parse(localStorage.getItem("cbtUser"));

if(!userData){
  window.location.href = "login.html";
  return;
}

// Greeting
const greeting = document.getElementById("greeting");
const userInfo = document.getElementById("userInfo");
const avatar = document.getElementById("avatar");

if(greeting){
  const hour = new Date().getHours();
  let text = "Selamat Datang";
  if(hour < 12) text = "Selamat Pagi";
  else if(hour < 15) text = "Selamat Siang";
  else if(hour < 18) text = "Selamat Sore";
  else text = "Selamat Malam";
  greeting.innerText = text;
}

if(userInfo){
  userInfo.innerText = userData.nama + " - " + userData.kelas;
}

// Avatar (inisial nama)
if(avatar){
  const initial = userData.nama.charAt(0).toUpperCase();
  avatar.innerHTML = `<div class="avatar-circle">${initial}</div>`;
}


/* ================= FIREBASE READY CHECK ================= */

if(typeof firebase !== "undefined"){
  console.log("Firebase ready");
}else{
  console.warn("Firebase belum terload");
}


/* ================= MENU GRID (STEP 1) ================= */

const stepContent = document.getElementById("stepContent");

function renderMenuGrid(){

  if(!stepContent) return;

  stepContent.innerHTML = `
    <div class="menu-grid" id="menuGrid"></div>
  `;

  const menuData = [
    { title:"Latihan PG", icon:"📝", link:"exam-pg.html" },
    { title:"Studi Kasus", icon:"📚", link:"exam-case.html" },
    { title:"Leaderboard", icon:"🏆", link:"leaderboard.html" }
  ];

  const grid = document.getElementById("menuGrid");

  menuData.forEach(item => {

    const card = document.createElement("div");
    card.classList.add("menu-card");

    card.innerHTML = `
      <div class="menu-icon">${item.icon}</div>
      <div class="menu-title">${item.title}</div>
    `;

    card.onclick = () => {
      window.location.href = item.link;
    };

    grid.appendChild(card);
  });

}


/* ================= INITIAL LOAD ================= */

renderMenuGrid();

});
