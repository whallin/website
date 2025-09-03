import { PageHistoryTracker } from "./navigation/SidebarBase";

function handleLanguageSwitch() {
  const languageSwitcher = document.getElementById("language-switcher");

  if (languageSwitcher) {
    languageSwitcher.addEventListener("click", () => {
      PageHistoryTracker.skipNextPageTracking();
    });
  }
}

document.addEventListener("DOMContentLoaded", handleLanguageSwitch);
document.addEventListener("astro:page-load", handleLanguageSwitch);
