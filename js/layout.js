function toggleSidebar(){
  document.querySelector(".sidebar").classList.toggle("open");
}

/* Auto highlight menu */
document.addEventListener("DOMContentLoaded",()=>{
  const links=document.querySelectorAll(".menu a");
  const current=location.pathname.split("/").pop();

  links.forEach(link=>{
    if(link.getAttribute("href")===current){
      link.classList.add("active");
    }
  });
});

document.getElementById("avatar").innerHTML =
  generateAvatar(user.nama);

function generateAvatar(){

  const user = JSON.parse(localStorage.getItem("cbtUser"));
  if(!user) return;

  const initial = user.nama.charAt(0).toUpperCase();

  const avatarText = document.getElementById("avatarText");
  if(avatarText){
    avatarText.textContent = initial;
  }
}

document.addEventListener("DOMContentLoaded",generateAvatar);
