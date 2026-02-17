/* ===============================
   DASHBOARD ENGINE
================================ */

const user = Auth.getUser();


document.getElementById("greeting").innerText =
  "Selamat datang,";

document.getElementById("userInfo").innerText =
  `${user.nama} (${user.kelas})`;

let currentStep = 1;

let state = {
  mapel:null,
  paket:null,
  tipe:null
};

const stepContent = document.getElementById("stepContent");
const steps = document.querySelectorAll(".step");


/* STEP CLICK */
steps.forEach(step=>{
  step.addEventListener("click",()=>{
    currentStep = parseInt(step.dataset.step);
    updateStep();
  });
});

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

  // smooth animation
  stepContent.style.opacity = 0;
  stepContent.style.transform = "translateY(5px)";

  setTimeout(()=>{
    renderContent();
    stepContent.style.opacity = 1;
    stepContent.style.transform = "translateY(0)";
  },150);
}



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



async function startExam(){

  if(!state.mapel || !state.paket || !state.tipe){
    alert("Lengkapi semua pilihan!");
    return;
  }

  localStorage.setItem("examState",
    JSON.stringify(state));

  if(!confirm("Ujian akan dimulai dalam mode fullscreen. Lanjutkan?")){
    return;
  }

  try {

    if(document.documentElement.requestFullscreen){
      await document.documentElement.requestFullscreen();
    }

    if(state.tipe==="Pilihan Ganda"){
      window.location.href="pg.html";
    } else {
      window.location.href="studi-kasus.html";
    }

  } catch (err){
    alert("Browser menolak mode fullscreen.");
  }
}


         

/* INIT */
updateStep();
