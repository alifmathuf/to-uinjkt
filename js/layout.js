// ===============================
// SIDEBAR TOGGLE
// ===============================
function toggleSidebar(){
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.getElementById("sidebarOverlay");

  if(!sidebar) return;

  sidebar.classList.toggle("open");

  if(overlay){
    overlay.classList.toggle("show");
  }
}
// klik overlay menutup sidebar
document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("sidebarOverlay");
  if(overlay){
    overlay.addEventListener("click", toggleSidebar);
  }
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
