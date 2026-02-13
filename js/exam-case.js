/* ===============================
   STUDI KASUS ENGINE
================================ */

const examState = JSON.parse(localStorage.getItem("examState"));
if(!examState) window.location.href="dashboard.html";

let soalData=[];
let soalUjian=[];
let jawaban=[];
let duration=30*60; // 30 menit
let endTime;


/* LOAD SOAL */
fetch(`./paket/${examState.paket}.json`)
.then(res=>res.json())
.then(data=>{

  soalData=shuffle(data);
  soalUjian=soalData.slice(0,4);

  const saved=localStorage.getItem("caseAnswers");
  jawaban=saved?JSON.parse(saved):
           new Array(4).fill("");

  renderCase();
  startTimer();
  enterFullscreen();
});


/* TIMER */
function startTimer(){

  const savedEnd=localStorage.getItem("caseEndTime");

  if(savedEnd){
    endTime=parseInt(savedEnd);
  }else{
    endTime=Date.now()+duration*1000;
    localStorage.setItem("caseEndTime",endTime);
  }

  setInterval(()=>{

    const remaining=Math.floor(
      (endTime-Date.now())/1000
    );

    if(remaining<=0){
      submitCase();
    }

    const m=Math.floor(remaining/60);
    const s=remaining%60;

    document.getElementById("timer").innerText=
      `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;

  },1000);
}


/* RENDER */
function renderCase(){

  document.getElementById("examInfo").innerText=
    `${examState.mapel} | Studi Kasus`;

  const container=document.getElementById("caseContainer");
  container.innerHTML="";

  soalUjian.forEach((q,index)=>{

    const div=document.createElement("div");
    div.className="card";
    div.style.marginBottom="20px";

    div.innerHTML=`
      <h3>Soal ${index+1}</h3>
      <p>${q.q}</p>
      <textarea
        oninput="saveAnswer(${index},this.value)"
      >${jawaban[index]}</textarea>
    `;

    container.appendChild(div);
  });
}


/* AUTOSAVE */
function saveAnswer(index,value){
  jawaban[index]=value;
  localStorage.setItem("caseAnswers",
    JSON.stringify(jawaban));
}


/* SUBMIT */
function submitCase(){

  localStorage.removeItem("caseEndTime");

  localStorage.setItem("caseResult",
    JSON.stringify(jawaban));

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
    submitCase();
  }
});


/* DISABLE BACK */
history.pushState(null,null,location.href);
window.onpopstate=function(){
  history.go(1);
};
