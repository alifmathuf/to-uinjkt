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
