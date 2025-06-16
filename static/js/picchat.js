document.addEventListener("DOMContentLoaded", function () {
  const emotionBtn = document.getElementById("pic-btn");
  const emotionResult = document.getElementById("pic-result");
  const loader = document.getElementById("loader");
  const video = document.getElementById("video");
  const startChatBtn = document.getElementById("start-chat-btn");

  let analysisResult = "";

  emotionBtn.onclick = async function () {
    // Capture frame
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = video.videoWidth || 320;
    tempCanvas.height = video.videoHeight || 240;
    const ctx = tempCanvas.getContext("2d");
    ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);

    // Get base64
    const base64 = tempCanvas.toDataURL("image/png").split(",")[1];

    loader.style.display = "block";
    emotionResult.innerText = "";
    startChatBtn.style.display = "none";

    fetch("/pic_chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_base64: base64,
        user_message: "What emotion do I look like?",
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        loader.style.display = "none";
        analysisResult = data.reply || data.message || "No response.";
        emotionResult.innerText = analysisResult;
        startChatBtn.style.display = "block";
      })
      .catch(() => {
        loader.style.display = "none";
        emotionResult.innerText = "Error analyzing emotion.";
      });
  };

  startChatBtn.onclick = function () {
    // Store the analysis result in localStorage and go to /chat
    localStorage.setItem("picchat_analysis", analysisResult);
    window.location.href = "/chat";
  };
});
