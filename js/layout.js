/* =========================
   GLOBAL UI CONTROLLER
========================= */

document.addEventListener("DOMContentLoaded", () => {

  const toggleBtn = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");

  /* ===== Sidebar Toggle ===== */
  if(toggleBtn){
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("show");
    });
  }

  /* ===== Auto close on mobile menu click ===== */
  const links = sidebar ? sidebar.querySelectorAll("a") : [];
  links.forEach(link => {
    link.addEventListener("click", () => {
      if(window.innerWidth < 900){
        sidebar.classList.remove("show");
      }
    });
  });

  /* ===== Close when click outside ===== */
  document.addEventListener("click", (e) => {
    if(window.innerWidth < 900 && sidebar.classList.contains("show")){
      if(!sidebar.contains(e.target) && !toggleBtn.contains(e.target)){
        sidebar.classList.remove("show");
      }
    }
  });

});
// ===============================
// AUTO ACTIVE MENU
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll(".menu a");
  const current = location.pathname.split("/").pop();

  links.forEach(link => {
    if(link.getAttribute("href") === current){
      link.classList.add("active");
    }
  });

  generateAvatar(); // jalankan setelah DOM siap
});


// ===============================
// GENERATE AVATAR
// ===============================
function generateAvatar(){

  if(typeof Auth === "undefined") return;

  const user = Auth.getUser();
  if(!user || !user.nama) return;

  const name = user.nama.trim();
  const firstLetter = name.charAt(0).toUpperCase();

  const avatar = document.getElementById("avatar");
  if(!avatar) return;

  avatar.innerText = firstLetter;

  // warna konsisten berdasarkan nama
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
