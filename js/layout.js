function toggleSidebar(){
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.getElementById("sidebarOverlay");

  sidebar.classList.toggle("open");

  if(overlay){
    overlay.classList.toggle("active");
  }
}
document.getElementById("sidebarOverlay")
?.addEventListener("click", toggleSidebar);


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
document.addEventListener("DOMContentLoaded",()=>{

  const avatar = document.getElementById("avatar");
  if(!avatar || typeof Auth === "undefined") return;

  const user = Auth.getUser();
  if(!user || !user.nama) return;

  const firstLetter = user.nama.charAt(0).toUpperCase();

  avatar.innerText = firstLetter;

  const colors = [
    "#2563eb",
    "#0ea5e9",
    "#14b8a6",
    "#8b5cf6",
    "#f59e0b",
    "#ef4444"
  ];

  avatar.style.background =
    colors[user.nama.charCodeAt(0) % colors.length];
});

/* ===============================
   INIT UI SAFE
================================ */
document.addEventListener("DOMContentLoaded",()=>{
  generateAvatar();
});
function toggleSidebar(){
  document.querySelector(".sidebar").classList.toggle("active");
}
if(window.innerWidth > 1024){
  document.querySelector(".sidebar").classList.add("collapsed");
}
