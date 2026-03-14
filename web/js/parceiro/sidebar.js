const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const sidebarClose = document.getElementById("sidebarClose");

if (menuToggle && sidebar) {
  menuToggle.addEventListener("click", () => {
    sidebar.classList.add("open");
  });
}

if (sidebarClose && sidebar) {
  sidebarClose.addEventListener("click", () => {
    sidebar.classList.remove("open");
  });
}

document.addEventListener("click", (event) => {
  const isMobile = window.innerWidth <= 768;
  if (!isMobile || !sidebar) return;

  const clickedInsideSidebar = sidebar.contains(event.target);
  const clickedMenuButton = menuToggle && menuToggle.contains(event.target);

  if (!clickedInsideSidebar && !clickedMenuButton) {
    sidebar.classList.remove("open");
  }
});