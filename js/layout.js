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

function toggleUserMenu(){
  document.getElementById("userDropdown")
    .classList.toggle("show");
}

window.onclick = function(e){
  if(!e.target.closest(".user-menu")){
    document.getElementById("userDropdown")
      .classList.remove("show");
  }
}
