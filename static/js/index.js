window.addEventListener("DOMContentLoaded", () => {
  const flash = document.querySelector(".flash-messages");
  if (flash) {
    setTimeout(() => {
      flash.classList.add("hide");
    }, 3500); // 3.5 seconds
  }
});
