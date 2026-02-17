/* ===============================
   AUTH MODULE - STABLE VERSION
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

    // 1️⃣ SIMPAN LOCAL (WAJIB)
    localStorage.setItem("cbtUser", JSON.stringify(userData));

    // 2️⃣ COBA SIMPAN FIREBASE (TIDAK BOLEH BLOK LOGIN)
    try{
      if(typeof firebase !== "undefined" && typeof database !== "undefined"){
        database.ref("users/" + userId).set({
          nama: nama,
          kelas: kelas,
          lastLogin: Date.now()
        });
      }
    }catch(err){
      console.log("Firebase skip:", err);
    }

  },

  logout(){

  clearUserStorage(); // 🔥 wajib

  localStorage.removeItem("cbtUser");
  localStorage.removeItem("examState");

  localStorage.removeItem("studiKasusData");
  localStorage.removeItem("jawabanStudiKasus");

  window.location.href = "index.html";
}

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

  // Redirect HARUS selalu jalan
  window.location.href = "dashboard.html";
}
async function isAdmin(){
  const user = Auth.getUser(); // 🔥 pakai ini
  if(!user) return false;

  const snap = await firebase.database()
    .ref("admins")
    .orderByChild("email")
    .equalTo(user.email)
    .once("value");

  return snap.exists();
}

function clearUserStorage() {
  const user = Auth.getUser();
  if (!user) return;

  const keys = [
    "pgAnswers",
    "examEndTime",
    "reviewData",
    "reviewSoal",
    "reviewJawaban",
    "caseAnswers",
    "caseResult"
  ];

  keys.forEach(k => {
    localStorage.removeItem(`${k}_${user.id}`);
  });
}
