const updateSwedenTime = () => {
  const timeElement = document.getElementById("time-sweden");
  if (!timeElement) return;

  const now = new Date();
  const swedenTime = now.toLocaleString("sv-SE", {
    timeZone: "Europe/Stockholm",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  timeElement.textContent = swedenTime;

  const swedenDateTime = now
    .toLocaleString("sv-SE", {
      timeZone: "Europe/Stockholm",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
    .replace(" ", "T");
  timeElement.setAttribute("datetime", swedenDateTime);
};

document.addEventListener("astro:page-load", () => {
  updateSwedenTime();
  setInterval(updateSwedenTime, 1000);
});
