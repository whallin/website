function initializeTheme() {
  const isDark =
    localStorage.theme === "dark" ||
    (!localStorage.theme &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  localStorage.theme = isDark ? "dark" : "light";
  document.documentElement.classList.toggle("dark", isDark);
}

function setupThemeToggle() {
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", handleThemeToggle);
  }
}

function handleThemeToggle() {
  const isDark = localStorage.theme === "light";
  localStorage.theme = isDark ? "dark" : "light";
  document.documentElement.classList.toggle("dark", isDark);
}

initializeTheme();
setupThemeToggle();

document.addEventListener("astro:page-load", () => {
  initializeTheme();
  setupThemeToggle();
});

document.addEventListener("astro:before-swap", () => {
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.removeEventListener("click", handleThemeToggle);
  }
});
