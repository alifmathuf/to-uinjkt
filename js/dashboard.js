document.addEventListener("DOMContentLoaded", function(){

/* ================= SAFE USER LOAD ================= */

let userData = null;

try{
  userData = JSON.parse(localStorage.getItem("cbtUser"));
}catch(e){
  console.error("User parse error");
}

if(!userData){
  window.location.href = "login.html";
  return;
}

/* ================= UI INIT ================= */

initUserUI();
initStepper();
renderStep1();


/* ================= FUNCTIONS ================= */

function initUserUI(){

  const greeting = document.getElementById("greeting");
  const userInfo = document.getElementById("userInfo");
  const avatar = document.getElementById("avatar");

  if(greeting){
    const hour = new Date().getHours();
    greeting.innerText =
      hour < 12 ? "Selamat Pagi" :
      hour < 15 ? "Selamat Siang" :
      hour < 18 ? "Selamat Sore" :
      "Selamat Malam";
  }

  if(userInfo){
    userInfo.innerText = userData.nama + " - " + userData.kelas;
  }

  if(avatar){
    avatar.innerHTML =
      `<div class="avatar-circle">
        ${userData.nama.charAt(0).toUpperCase()}
      </div>`;
  }
}


/* ================= STEPPER ================= */

function initStepper(){

  const steps = document.querySelectorAll(".step");

  steps.forEach(step=>{
    step.addEventListener("click", function(){
      const stepNumber = this.dataset.step;
      setActiveStep(stepNumber);
    });
  });
}

function setActiveStep(stepNumber){

  const steps = document.querySelectorAll(".step");

  steps.forEach(step=>{
    step.classList.remove("active");
    if(step.dataset.step == stepNumber){
      step.classList.add("active");
    }
  });
}


/* ================= STEP 1 CONTENT ================= */

function renderStep1(){

  const container = document.getElementById("stepContent");
  if(!container) return;

  container.innerHTML = `
    <div class="menu-grid" id="menuGrid"></div>
  `;

  const menuData = [
    { title:"Latihan PG", icon:"📝", link:"exam-pg.html" },
    { title:"Studi Kasus", icon:"📚", link:"exam-case.html" },
    { title:"Leaderboard", icon:"🏆", link:"leaderboard.html" }
  ];

  const grid = document.getElementById("menuGrid");

  menuData.forEach(item=>{
    const card = document.createElement("div");
    card.className = "menu-card";

    card.innerHTML = `
      <div class="menu-icon">${item.icon}</div>
      <div class="menu-title">${item.title}</div>
    `;

    card.onclick = () => window.location.href = item.link;

    grid.appendChild(card);
  });
}


/* ================= SAFE FIREBASE OPTIONAL ================= */

try{
  if(typeof firebase !== "undefined"){
    console.log("Firebase OK");
    // optional database usage here
  }
}catch(e){
  console.warn("Firebase error tidak menghentikan UI");
}

});
