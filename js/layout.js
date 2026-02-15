/* ===============================
   SIDEBAR TOGGLE
================================ */
function toggleSidebar(){
  const sidebar = document.querySelector(".sidebar");
  if(sidebar){
    sidebar.classList.toggle("open");
  }
}


/* ===============================
   AUTO ACTIVE MENU
================================ */
document.addEventListener("DOMContentLoaded",()=>{

  const links = document.querySelectorAll(".menu a");
  const current = location.pathname.split("/").pop();

  links.forEach(link=>{
    if(link.getAttribute("href") === current){
      link.classList.add("active");
    }
  });

});


/* ===============================
   GENERATE AVATAR
================================ */
function generateAvatar(){

  const avatar = document.getElementById("avatar");
  if(!avatar || typeof Auth === "undefined") return;

  const user = Auth.getUser();
  if(!user || !user.nama) return;

  const name = user.nama.trim();
  const firstLetter = name.charAt(0).toUpperCase();

  avatar.innerText = firstLetter;

  /* warna konsisten */
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


/* ===============================
   INIT UI SAFE
================================ */
document.addEventListener("DOMContentLoaded",()=>{
  generateAvatar();
});
