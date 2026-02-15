document.addEventListener("DOMContentLoaded", () => {

  const toggleBtn = document.querySelector(".hamburger");
  const sidebar = document.querySelector(".sidebar");
  const menuLinks = document.querySelectorAll(".menu a");

  // toggle buka/tutup
  if(toggleBtn){
    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      sidebar.classList.toggle("open");
    });
  }

  // tutup saat klik menu
  menuLinks.forEach(link => {
    link.addEventListener("click", () => {
      sidebar.classList.remove("open");
    });
  });

  // tutup saat klik luar sidebar
  document.addEventListener("click", (e) => {
    if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
      sidebar.classList.remove("open");
    }
  });

});
