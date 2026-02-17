// ==========================================
// SIDEBAR TOGGLE - FINAL FIXED VERSION
// ==========================================

/**
 * Toggle sidebar (buka jika tertutup, tutup jika terbuka)
 */
function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");
    
    if (!sidebar) return;
    
    const isOpen = sidebar.classList.contains("open");
    
    if (isOpen) {
        closeSidebar();
    } else {
        openSidebar();
    }
}

/**
 * Buka sidebar
 */
function openSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");
    
    if (!sidebar) return;
    
    // Buka sidebar
    sidebar.classList.add("open");
    
    // Aktifkan overlay
    if (overlay) {
        overlay.classList.add("active");
    }
    
    // Prevent body scroll
    document.body.style.overflow = "hidden";
}

/**
 * Tutup sidebar
 */
function closeSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");
    
    if (!sidebar) return;
    
    // Tutup sidebar
    sidebar.classList.remove("open");
    
    // Nonaktifkan overlay
    if (overlay) {
        overlay.classList.remove("active");
    }
    
    // Restore body scroll
    document.body.style.overflow = "";
}

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener("DOMContentLoaded", function() {
    initSidebar();
    initActiveMenu();
    generateAvatar();
});

function initSidebar() {
    // Overlay click untuk menutup
    const overlay = document.getElementById("sidebarOverlay");
    if (overlay) {
        overlay.addEventListener("click", closeSidebar);
    }
    
    // Tutup saat klik link di mobile
    const menuLinks = document.querySelectorAll(".sidebar .menu a");
    menuLinks.forEach(function(link) {
        link.addEventListener("click", function() {
            // Tutup sidebar hanya di mobile (<= 1024px)
            if (window.innerWidth <= 1024) {
                closeSidebar();
            }
        });
    });
    
    // Tutup dengan tombol Escape
    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape") {
            closeSidebar();
        }
    });
    
    // Handle resize window dengan debounce
    let resizeTimer;
    window.addEventListener("resize", function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(handleWindowResize, 250);
    });
    
    // Initial check
    handleWindowResize();
}

/**
 * Handle window resize
 */
function handleWindowResize() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");
    
    if (!sidebar) return;
    
    if (window.innerWidth > 1024) {
        // Desktop: selalu buka, hapus overlay
        sidebar.classList.remove("open");
        if (overlay) {
            overlay.classList.remove("active");
        }
        document.body.style.overflow = "";
    } else {
        // Mobile: pastikan tertutup saat resize dari desktop
        if (!sidebar.classList.contains("open")) {
            // Sudah tertutup, biarkan
        }
    }
}

// ==========================================
// AUTO ACTIVE MENU
// ==========================================

function initActiveMenu() {
    const links = document.querySelectorAll(".menu a");
    const currentPage = location.pathname.split("/").pop() || "dashboard.html";
    
    links.forEach(function(link) {
        const href = link.getAttribute("href");
        // Hapus semua active dulu
        link.classList.remove("active");
        
        // Tambah active jika match
        if (href === currentPage || 
            (currentPage === "" && href === "dashboard.html") ||
            (currentPage === "index.html" && href === "dashboard.html")) {
            link.classList.add("active");
        }
    });
}

// ==========================================
// GENERATE AVATAR
// ==========================================

function generateAvatar() {
    if (typeof Auth === "undefined") return;
    
    const user = Auth.getUser();
    if (!user || !user.nama) return;
    
    const name = user.nama.trim();
    const firstLetter = name.charAt(0).toUpperCase();
    
    const avatar = document.getElementById("avatar");
    if (!avatar) return;
    
    avatar.innerText = firstLetter;
    
    // Warna konsisten berdasarkan nama
    const colors = [
        "#2563eb", // blue
        "#0ea5e9", // sky
        "#14b8a6", // teal
        "#8b5cf6", // violet
        "#f59e0b", // amber
        "#ef4444"  // red
    ];
    
    const index = name.charCodeAt(0) % colors.length;
    avatar.style.background = colors[index];
}
