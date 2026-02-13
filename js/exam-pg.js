/* ===============================
   PG EXAM ENGINE - SECURE
================================ */

const examState = JSON.parse(localStorage.getItem("examState"));
if(!examState) window.location.href="dashboard.html";

let soalData=[];
let soalUjian=[];
let jawaban=[];
let current=0;
let duration=120*60; // 120 menit
let endTime;


/* LOAD SOAL */
fetch(`paket/${examState.paket}.json`)
.then(res=>res.json())
.then(data=>{

  soalData=shuffle(data);
  soalUjian=soalData.slice(0,50);

  const savedAnswers=localStorage.getItem("pgAnswers");
  jawaban=savedAnswers?JSON.parse(savedAnswers):
           new Array(50).fill(null);

  startTimer();
  renderQuestion();
  renderNumberNav();
  enterFullscreen();
});


/* TIMER */
function startTimer(){

  const savedEnd=localStorage.getItem("examEndTime");

  if(savedEnd){
    endTime=parseInt(savedEnd);
  }else{
    endTime=Date.now()+duration*1000;
    localStorage.setItem("examEndTime",endTime);
  }

  setInterval(()=>{

    const remaining=Math.floor(
      (endTime-Date.now())/1000
    );

    if(remaining<=0){
      submitExam();
    }

    const m=Math.floor(remaining/60);
    const s=remaining%60;

    document.getElementById("timer").innerText=
      `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;

  },1000);
}


/* RENDER QUESTION */
function renderQuestion(){

  const q=soalUjian[current];

  document.getElementById("examInfo").innerText=
    `${examState.mapel} | ${examState.paket}`;

  document.getElementById("questionBox").innerHTML=`
    <h3>Soal ${current+1}</h3>
    <p>${q.q}</p>
    ${q.options.map((opt,i)=>`
      <div>
        <input type="radio" name="jawab"
        ${jawaban[current]===i?"checked":""}
        onclick="saveAnswer(${i})">
        ${opt}
      </div>
    `).join("")}
  `;

  updateNumberNav();
}


/* SAVE ANSWER */
function saveAnswer(i){
  jawaban[current]=i;
  localStorage.setItem("pgAnswers",
    JSON.stringify(jawaban));
}


/* NAV */
function nextQuestion(){
  if(current<49){
    current++;
    renderQuestion();
  }
}

function prevQuestion(){
  if(current>0){
    current--;
    renderQuestion();
  }
}


/* NUMBER NAV */
function renderNumberNav(){

  const nav=document.getElementById("numberNav");
  nav.innerHTML="";

  for(let i=0;i<50;i++){

    const btn=document.createElement("button");
    btn.innerText=i+1;

    btn.onclick=()=>{
      current=i;
      renderQuestion();
    };

    nav.appendChild(btn);
  }
}

function updateNumberNav(){
  const buttons=document.querySelectorAll(".number-nav button");

  buttons.forEach((btn,i)=>{
    btn.classList.toggle(
      "answered",
      jawaban[i]!==null
    );
  });
}


/* SUBMIT */
function submitExam(){

  let score=0;

  soalUjian.forEach((s,i)=>{
    if(jawaban[i]===s.answer){
      score++;
    }
  });

  localStorage.setItem("pgScore",score);
  localStorage.removeItem("examEndTime");

  window.location.href="result.html";
}


/* SHUFFLE */
function shuffle(arr){
  return arr.sort(()=>Math.random()-0.5);
}


/* FULLSCREEN */
function enterFullscreen(){
  if(document.documentElement.requestFullscreen){
    document.documentElement.requestFullscreen();
  }
}

document.addEventListener("fullscreenchange",()=>{
  if(!document.fullscreenElement){
    submitExam();
  }
});


/* DISABLE BACK */
history.pushState(null,null,location.href);
window.onpopstate=function(){
  history.go(1);
};
