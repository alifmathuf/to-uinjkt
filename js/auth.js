/* ===============================
   AUTH MODULE - STABLE VERSION
   + ADMIN SUPPORT SAFE
================================ */

const Auth = {

  login(nama, kelas){

    const userId = generateUserId(nama, kelas);

    // ✅ tentukan role admin otomatis
    const role = (nama.toLowerCase() === "admin") ? "admin" : "user";

    const userData = {
      id: userId,
      nama: nama,
      kelas: kelas,
      role: role,
      loginAt: Date.now()
    };

    // 1️⃣ SIMPAN LOCAL
    localStorage.setItem("cbtUser", JSON.stringify(userData));

    // 2️⃣ SIMPAN FIREBASE (optional)
    try{
      if(typeof firebase !== "undefined" && typeof database !== "undefined"){
        database.ref("users/" + userId).set({
          nama: nama,
          kelas: kelas,
          role: role,
          lastLogin: Date.now()
        });
      }
    }catch(err){
      console.log("Firebase skip:", err);
    }

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
   SHOW ADMIN MENU (SAFE)
================================ */

document.addEventListener("DOMContentLoaded", () => {

  const user = Auth.getUser();
  const adminLink = document.getElementById("adminLink");

  if(user && adminLink && user.role === "admin"){
    adminLink.style.display = "block";
  }

});


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
