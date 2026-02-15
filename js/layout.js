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
   AVATAR RENDER (SAFE)
================================ */
document.addEventListener("DOMContentLoaded",()=>{

  const avatarEl = document.getElementById("avatar");

  if(!avatarEl) return;

  if(typeof Auth !== "undefined"){
    const user = Auth.getUser();

    if(user && user.nama){
      avatarEl.innerHTML = generateAvatar(user.nama);
    }
  }

});


/* ===============================
   GENERATE AVATAR
================================ */
function generateAvatar(nama){

  const initials = nama
    .split(" ")
    .map(n => n[0])
    .join("")
    .substring(0,2)
    .toUpperCase();

  return `<div class="avatar-circle">${initials}</div>`;
}
