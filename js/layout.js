// ==========================================
// SIDEBAR TOGGLE - FIXED VERSION
// ==========================================

/**
 * Toggle sidebar untuk mobile dan desktop
 * Bisa buka dan tutup dengan benar
 */
function toggleSidebar() {
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.getElementById("sidebarOverlay");
    
    if (!sidebar) return;
    
    // Toggle class 'open' untuk mobile
    sidebar.classList.toggle("open");
    
    // Toggle overlay jika ada
    if (overlay) {
        overlay.classList.toggle("active");
    }
    
    // Toggle class 'active' untuk kompatibilitas dengan CSS lama
    sidebar.classList.toggle("active");
    
    // Prevent body scroll saat sidebar terbuka di mobile
    if (sidebar.classList.contains("open")) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

/**
 * Tutup sidebar (fungsi spesifik untuk tombol close)
 */
function closeSidebar() {
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.getElementById("sidebarOverlay");
    
    if (!sidebar) return;
    
    sidebar.classList.remove("open", "active");
    
    if (overlay) {
        overlay.classList.remove("active");
    }
    
    document.body.style.overflow = '';
}

/**
 * Buka sidebar (fungsi spesifik untuk tombol hamburger)
 */
function openSidebar() {
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.getElementById("sidebarOverlay");
    
    if (!sidebar) return;
    
    sidebar.classList.add("open", "active");
    
    if (overlay) {
        overlay.classList.add("active");
    }
    
    document.body.style.overflow = 'hidden';
}

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    // Setup toggle button
    const toggleBtn = document.getElementById("sidebarToggle") || document.querySelector(".toggle-sidebar");
    if (toggleBtn) {
        toggleBtn.addEventListener("click", function(e) {
            e.stopPropagation();
            toggleSidebar();
        });
    }
    
    // Setup overlay click untuk menutup
    const overlay = document.getElementById("sidebarOverlay");
    if (overlay) {
        overlay.addEventListener("click", closeSidebar);
    }
    
    // Setup tombol close di dalam sidebar (jika ada)
    const closeBtn = document.getElementById("sidebarClose") || document.querySelector(".sidebar-close");
    if (closeBtn) {
        closeBtn.addEventListener("click", function(e) {
            e.stopPropagation();
            closeSidebar();
        });
    }
    
    // Tutup sidebar saat klik link di mobile
    const menuLinks = document.querySelectorAll(".sidebar .menu a");
    menuLinks.forEach(link => {
        link.addEventListener("click", function() {
            if (window.innerWidth <= 1024) {
                closeSidebar();
            }
        });
    });
    
    // Tutup sidebar saat tekan Escape
    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape") {
            closeSidebar();
        }
    });
    
    // Handle resize window
    handleResize();
    window.addEventListener("resize", handleResize);
    
    // Init lainnya
    initActiveMenu();
    generateAvatar();
});

/**
 * Handle window resize
 */
function handleResize() {
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.getElementById("sidebarOverlay");
    
    if (!sidebar) return;
    
    if (window.innerWidth > 1024) {
        // Desktop: collapsed mode, hapus open/active mobile
        sidebar.classList.remove("open", "active");
        sidebar.classList.add("collapsed");
        
        if (overlay) {
            overlay.classList.remove("active");
        }
        
        document.body.style.overflow = '';
    } else {
        // Mobile: hapus collapsed, siap untuk toggle
        sidebar.classList.remove("collapsed");
    }
}

// ==========================================
// AUTO ACTIVE MENU
// ==========================================

function initActiveMenu() {
    const links = document.querySelectorAll(".menu a");
    const current = location.pathname.split("/").pop() || "index.html";
    
    links.forEach(link => {
        const href = link.getAttribute("href");
        if (href === current || href === "./" + current) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
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
