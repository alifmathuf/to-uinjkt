/* ===============================
   DASHBOARD ENGINE + FIREBASE SYNC
================================ */

// ===============================
// 🔥 FIREBASE CONFIG
// GANTI DENGAN CONFIG PUNYA ANDA
// ===============================

const firebaseConfig = {
  apiKey: "ISI_API_KEY",
  authDomain: "ISI_AUTH_DOMAIN",
  databaseURL: "ISI_DATABASE_URL",
  projectId: "ISI_PROJECT_ID",
  storageBucket: "ISI_STORAGE_BUCKET",
  messagingSenderId: "ISI_SENDER_ID",
  appId: "ISI_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();


// ===============================
// USER
// ===============================

const user = Auth.getUser();

if(!user){
  window.location.href="login.html";
}

document.getElementById("greeting").innerText =
  "Selamat datang,";

document.getElementById("userInfo").innerText =
  `${user.nama} (${user.kelas})`;


// ===============================
// 🔥 SYNC USER KE LEADERBOARD GLOBAL
// ===============================

function syncUserToLeaderboard(){

  const userRef = db.ref("leaderboard/" + user.id);

  userRef.once("value", snapshot=>{
    if(!snapshot.exists()){
      userRef.set({
        nama: user.nama,
        kelas: user.kelas,
        totalScore: 0,
        lastUpdate: Date.now()
      });
    }
  });
}

syncUserToLeaderboard();


// ===============================
// STEPPER STATE
// ===============================

let currentStep = 1;

let state = {
  mapel:null,
  paket:null,
  tipe:null
};

const stepContent = document.getElementById("stepContent");
const steps = document.querySelectorAll(".step");


// ===============================
// STEP CLICK
// ===============================

steps.forEach(step=>{
  step.addEventListener("click",()=>{
    currentStep = parseInt(step.dataset.step);
    updateStep();
  });
});


// ===============================
// UPDATE STEP
// ===============================

function updateStep(){

  steps.forEach(s=>{
    s.classList.remove("active","completed");

    const stepNumber = parseInt(s.dataset.step);

    if(stepNumber < currentStep){
      s.classList.add("completed");
    }

    if(stepNumber === currentStep){
      s.classList.add("active");
    }
  });

  stepContent.style.opacity = 0;
  stepContent.style.transform = "translateY(5px)";

  setTimeout(()=>{
    renderContent();
    stepContent.style.opacity = 1;
    stepContent.style.transform = "translateY(0)";
  },150);
}


// ===============================
// RENDER CONTENT
// ===============================

function renderContent(){

  stepContent.innerHTML="";

  if(currentStep===1){
    renderOptions([
      "Aqidah","Qurdist","Fiqih","SKI",
      "PAI","Arab","GKRA","GKMI"
    ],"mapel");
  }

  if(currentStep===2){
    renderOptions([
      "paket1","paket2","paket3",
      "paket4","paket5"
    ],"paket");
  }

  if(currentStep===3){
    renderOptions([
      "Pilihan Ganda",
      "Studi Kasus"
    ],"tipe");
  }

  if(currentStep===4){
    stepContent.innerHTML=`
      <div class="accordion">
        <h3>Konfirmasi Ujian</h3>
        <p><b>Mapel:</b> ${state.mapel}</p>
        <p><b>Paket:</b> ${state.paket}</p>
        <p><b>Tipe:</b> ${state.tipe}</p>
        <br>
        <button class="btn-primary" onclick="startExam()">
          Mulai Ujian
        </button>
      </div>
    `;
  }
}


// ===============================
// RENDER OPTIONS
// ===============================

function renderOptions(list,type){

  const wrapper=document.createElement("div");
  wrapper.className="accordion";

  const grid=document.createElement("div");
  grid.className="option-grid";

  list.forEach(item=>{

    const div=document.createElement("div");
    div.className="option-item";
    div.innerText=item;

    if(state[type]===item){
      div.classList.add("active");
    }

    div.onclick=()=>{
      state[type]=item;
      currentStep++;
      updateStep();
    };

    grid.appendChild(div);
  });

  wrapper.appendChild(grid);
  stepContent.appendChild(wrapper);
}


// ===============================
// AVATAR GENERATOR
// ===============================

function generateAvatar(){

  if(!user || !user.nama) return;

  const name = user.nama.trim();
  const firstLetter = name.charAt(0).toUpperCase();

  const avatar = document.getElementById("avatar");
  if(!avatar) return;

  avatar.innerText = firstLetter;

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


// ===============================
// START EXAM
// ===============================

function startExam(){

  if(!state.mapel || !state.paket || !state.tipe){
    alert("Lengkapi semua pilihan!");
    return;
  }

  localStorage.setItem("examState",
    JSON.stringify(state));

  if(state.tipe==="Pilihan Ganda"){
    window.location.href="pg.html";
  } else {
    window.location.href="studi-kasus.html";
  }
}


// ===============================
// INIT
// ===============================

updateStep();
