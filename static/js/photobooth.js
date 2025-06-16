const video = document.getElementById("video");
const countdown = document.getElementById("countdown");
const strip = document.getElementById("strip");
const actions = document.getElementById("actions");
const takePhotosBtn = document.getElementById("take-photos-btn");
const downloadBtn = document.getElementById("download-btn");
const saveBtn = document.getElementById("save-btn");
const canvas1 = document.getElementById("canvas1");
const canvas2 = document.getElementById("canvas2");
const canvas3 = document.getElementById("canvas3");
const saveLoader = document.getElementById("save-loader");

let stream;

async function startCamera() {
  stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
}

async function takePhotos() {
  strip.style.display = "none";
  actions.style.display = "none";
  let canvases = [canvas1, canvas2, canvas3];
  let photos = [];
  for (let i = 0; i < 3; i++) {
    countdown.innerText = 3 - i;
    await new Promise((r) => setTimeout(r, 1000));
  }
  for (let i = 0; i < 3; i++) {
    countdown.innerText = 3;
    for (let j = 3; j > 0; j--) {
      countdown.innerText = j;
      await new Promise((r) => setTimeout(r, 1000));
    }
    canvases[i].getContext("2d").drawImage(video, 0, 0, 160, 120);
    photos.push(canvases[i].toDataURL("image/png"));
  }
  countdown.innerText = "";
  strip.style.display = "";
  actions.style.display = "";
}

takePhotosBtn.onclick = takePhotos;

const orientationRadios = document.getElementsByName("orientation");
const stripDiv = document.getElementById("strip");

function updateStripOrientation() {
  const orientation = document.querySelector(
    'input[name="orientation"]:checked'
  ).value;
  stripDiv.classList.remove("horizontal", "vertical");
  stripDiv.classList.add(orientation);
}
orientationRadios.forEach((radio) =>
  radio.addEventListener("change", updateStripOrientation)
);

// Call once to set initial orientation
updateStripOrientation();

downloadBtn.onclick = function () {
  const orientation = document.querySelector(
    'input[name="orientation"]:checked'
  ).value;
  let finalCanvas, ctx;
  if (orientation === "horizontal") {
    finalCanvas = document.createElement("canvas");
    finalCanvas.width = 160 * 3;
    finalCanvas.height = 120;
    ctx = finalCanvas.getContext("2d");
    ctx.drawImage(canvas1, 0, 0);
    ctx.drawImage(canvas2, 160, 0);
    ctx.drawImage(canvas3, 320, 0);
  } else {
    finalCanvas = document.createElement("canvas");
    finalCanvas.width = 160;
    finalCanvas.height = 120 * 3;
    ctx = finalCanvas.getContext("2d");
    ctx.drawImage(canvas1, 0, 0);
    ctx.drawImage(canvas2, 0, 120);
    ctx.drawImage(canvas3, 0, 240);
  }
  let link = document.createElement("a");
  link.download = "photobooth_strip.png";
  link.href = finalCanvas.toDataURL("image/png");
  link.click();
};

saveBtn.onclick = function () {
  const orientation = document.querySelector(
    'input[name="orientation"]:checked'
  ).value;
  let finalCanvas, ctx;
  if (orientation === "horizontal") {
    finalCanvas = document.createElement("canvas");
    finalCanvas.width = 160 * 3;
    finalCanvas.height = 120;
    ctx = finalCanvas.getContext("2d");
    ctx.drawImage(canvas1, 0, 0);
    ctx.drawImage(canvas2, 160, 0);
    ctx.drawImage(canvas3, 320, 0);
  } else {
    finalCanvas = document.createElement("canvas");
    finalCanvas.width = 160;
    finalCanvas.height = 120 * 3;
    ctx = finalCanvas.getContext("2d");
    ctx.drawImage(canvas1, 0, 0);
    ctx.drawImage(canvas2, 0, 120);
    ctx.drawImage(canvas3, 0, 240);
  }
  saveLoader.style.display = "block";
  finalCanvas.toBlob(function (blob) {
    const formData = new FormData();
    formData.append("strip", blob, "photobooth_strip.png");
    formData.append("orientation", orientation);
    fetch("/save_photobooth", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        saveLoader.style.display = "none";
        alert(data.message || "Saved!");
      })
      .catch(() => {
        saveLoader.style.display = "none";
        alert("Save failed!");
      });
  }, "image/png");
};

document.getElementById("emotion-btn").onclick = function () {
  window.location.href = "/pic-chat";
};

startCamera();
