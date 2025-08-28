function initMobileNav() {
  const mobileNavToggle = document.getElementById("mobile-nav-toggle");
  const mobileNav = document.getElementById("mobile-nav");
  const mobileNavClose = document.getElementById("mobile-nav-close");
  const body = document.body;

  if (!mobileNavToggle || !mobileNav || !mobileNavClose) return;

  mobileNavToggle.addEventListener("click", () => {
    mobileNav.classList.remove("hidden");
    body.style.overflow = "hidden";
  });

  mobileNavClose.addEventListener("click", () => {
    mobileNav.classList.add("hidden");
    body.style.overflow = "";
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !mobileNav.classList.contains("hidden")) {
      mobileNav.classList.add("hidden");
      body.style.overflow = "";
    }
  });

  const navLinks = mobileNav.querySelectorAll("nav a");
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mobileNav.classList.add("hidden");
      body.style.overflow = "";
    });
  });
}

document.addEventListener("DOMContentLoaded", initMobileNav);
document.addEventListener("astro:page-load", initMobileNav);
