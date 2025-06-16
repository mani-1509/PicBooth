const video = document.getElementById("video");
const takePhotosBtn = document.getElementById("take-photos-btn");
const strip = document.getElementById("strip");
const countdownEl = document.getElementById("countdown");
const downloadBtn = document.getElementById("download-btn");
const saveBtn = document.getElementById("save-btn");
const actions = document.getElementById("actions");
const saveLoader = document.getElementById("save-loader");
const frameSelect = document.getElementById("frameSelect");
const orientationRadios = document.getElementsByName("orientation");

const canvases = [
  document.getElementById("canvas1"),
  document.getElementById("canvas2"),
  document.getElementById("canvas3"),
];

navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
  video.srcObject = stream;
});

// Update video frame class on selection
frameSelect.addEventListener("change", () => {
  video.className = frameSelect.value;
});

function getSelectedOrientation() {
  for (let radio of orientationRadios) {
    if (radio.checked) return radio.value;
  }
  return "horizontal";
}

function applyFrameToCanvas(ctx, canvas, frameClass) {
  const frameStyles = {
    frame1: { color: "#00bfff", blur: 15, dash: [] },
    frame2: { color: "#00ff66", blur: 10, dash: [10, 5] },
    frame3: { color: "#ff66cc", blur: 15, dash: [2, 5] },
    frame4: { color: "#ff3300", blur: 20, dash: [] },
    frame5: { color: "#9933ff", blur: 20, dash: [] },
  };

  const style = frameStyles[frameClass];
  if (style) {
    ctx.strokeStyle = style.color;
    ctx.lineWidth = 8;
    ctx.shadowColor = style.color;
    ctx.shadowBlur = style.blur;
    ctx.setLineDash(style.dash);
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    ctx.setLineDash([]);
  }
}

function flashEffect() {
  const flash = document.getElementById("flash");
  flash.className = "flash-effect";
  flash.style.display = "block";
  setTimeout(() => {
    flash.style.display = "none";
    flash.className = "";
  }, 300);
}

async function takePhotos() {
  strip.style.display = "flex";
  actions.style.display = "none";
  saveLoader.style.display = "none";
  const frameClass = video.classList[0];

  for (let i = 0; i < canvases.length; i++) {
    countdownEl.textContent = 3;
    await new Promise((res) => setTimeout(res, 1000));
    countdownEl.textContent = 2;
    await new Promise((res) => setTimeout(res, 1000));
    countdownEl.textContent = 1;
    await new Promise((res) => setTimeout(res, 1000));
    countdownEl.textContent = "";

    const canvas = canvases[i];
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    applyFrameToCanvas(ctx, canvas, frameClass);
    flashEffect();
  }

  actions.style.display = "block";

  const orientation = getSelectedOrientation();
  strip.classList.remove("horizontal", "vertical");
  strip.classList.add(orientation);
}

takePhotosBtn.addEventListener("click", takePhotos);

downloadBtn.addEventListener("click", () => {
  const orientation = getSelectedOrientation();
  const stripCanvas = document.createElement("canvas");

  if (orientation === "horizontal") {
    stripCanvas.width = 160 * 3; // remove + 16
    stripCanvas.height = 120;
  } else {
    stripCanvas.width = 160;
    stripCanvas.height = 120 * 3; // remove + 16
  }

  const ctx = stripCanvas.getContext("2d");

  canvases.forEach((canvas, i) => {
    const x = orientation === "horizontal" ? i * 160 : 0;
    const y = orientation === "vertical" ? i * 120 : 0;
    ctx.drawImage(canvas, x, y);
  });

  const link = document.createElement("a");
  link.download = "photobooth_strip.png";
  link.href = stripCanvas.toDataURL("image/png");
  link.click();
});

// Dummy save (replace with your own backend logic)
saveBtn.addEventListener("click", () => {
  saveLoader.style.display = "block";
  actions.style.display = "none";

  setTimeout(() => {
    alert("Saved to Supabase (not really, lol 😅 implement me)");
    saveLoader.style.display = "none";
    actions.style.display = "block";
  }, 2000);
});
