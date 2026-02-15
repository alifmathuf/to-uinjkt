function toggleSidebar() {
  document.querySelector(".sidebar").classList.toggle("open");
  document.getElementById("sidebarOverlay").classList.toggle("show");
}

document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  const links = document.querySelectorAll(".menu a");

  // Tutup saat klik overlay
  overlay.addEventListener("click", () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
  });

  // Tutup saat klik menu
  links.forEach(link => {
    link.addEventListener("click", () => {
      sidebar.classList.remove("open");
      overlay.classList.remove("show");
    });
  });

  // Tutup saat klik luar sidebar (desktop)
  document.addEventListener("click", (e) => {
    const hamburger = document.querySelector(".hamburger");

    if (
      sidebar.classList.contains("open") &&
      !sidebar.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      sidebar.classList.remove("open");
      overlay.classList.remove("show");
    }
  });
});
