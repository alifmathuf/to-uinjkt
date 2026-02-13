/* ===============================
   AUTH MODULE - CBT SYSTEM
================================ */

const Auth = {

  login(nama, kelas){
    localStorage.setItem("nama", nama);
    localStorage.setItem("kelas", kelas);
  },

  logout(){
    localStorage.clear();
    window.location.href = "index.html";
  },

  isLoggedIn(){
    return !!localStorage.getItem("nama");
  },

  getUser(){
    return {
      nama: localStorage.getItem("nama"),
      kelas: localStorage.getItem("kelas")
    };
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
