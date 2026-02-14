/* ===============================
   AUTH MODULE - CBT SYSTEM
================================ */

const Auth = {

  login(nama, kelas){
    localStorage.setItem("cbtUser", JSON.stringify({
      nama:nama,
      kelas:kelas
    }));
  },

  logout(){
    localStorage.removeItem("cbtUser");
    window.location.href = "index.html";
  },

  isLoggedIn(){
    return !!localStorage.getItem("cbtUser");
  },

  getUser(){
    return JSON.parse(localStorage.getItem("cbtUser"));
  },

  protect(){
    if(!this.isLoggedIn()){
      window.location.href = "index.html";
    }
  },

  autoRedirect(){
    if(this.isLoggedIn()){
      window.location.href = "dashboard.html";
    }
  }

};


/* ===== GLOBAL LOGIN FUNCTION (UNTUK BUTTON) ===== */

function login(){

  const nama = document.getElementById("nama").value.trim();
  const kelas = document.getElementById("kelas").value.trim();

  if(!nama || !kelas){
    alert("Nama dan kelas wajib diisi");
    return;
  }

  Auth.login(nama, kelas);
  window.location.href = "dashboard.html";
}
function showToast(message,type="success"){

  let container = document.querySelector(".toast-container");

  if(!container){
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "toast " + type;
  toast.innerText = message;

  container.appendChild(toast);

  setTimeout(()=>{
    toast.style.opacity="0";
    toast.style.transform="translateX(20px)";
    setTimeout(()=>toast.remove(),300);
  },3000);
}
