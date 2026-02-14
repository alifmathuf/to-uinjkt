/* ===============================
   AUTH MODULE - CBT SYSTEM
   + FIREBASE SUPPORT
================================ */

const Auth = {

  login(nama, kelas){

    const userId = generateUserId(nama, kelas);

    const userData = {
      id: userId,
      nama: nama,
      kelas: kelas,
      loginAt: Date.now()
    };

    // Simpan ke localStorage (tetap seperti sistem lama)
    localStorage.setItem("cbtUser", JSON.stringify(userData));

    // Simpan ke Firebase (GLOBAL)
    saveUserToFirebase(userData);
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


/* ===============================
   FIREBASE SAVE USER
================================ */

function saveUserToFirebase(user){

  if(typeof firebase === "undefined") return;

  database.ref("users/" + user.id).set({
    nama: user.nama,
    kelas: user.kelas,
    lastLogin: Date.now()
  });

}


/* ===============================
   GENERATE USER ID
================================ */

function generateUserId(nama, kelas){
  return (
    nama.replace(/\s+/g,"").toLowerCase() +
    "_" +
    kelas.replace(/\s+/g,"").toLowerCase()
  );
}


/* ===============================
   GLOBAL LOGIN FUNCTION
================================ */

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


/* ===============================
   TOAST SYSTEM
================================ */

function showToast(message,type="success"){

  let container = document.querySelector(".toast-container");

  if(!container){
    container = document.createElement("div");
    container.className =
