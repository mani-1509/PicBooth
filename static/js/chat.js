document.addEventListener("DOMContentLoaded", async function () {
  let analysis = localStorage.getItem("picchat_analysis") || "Let's chat!";
  const chatMessages = document.getElementById("chat-messages");
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");

  // Show the analysis as a system message (UI only)
  chatMessages.innerHTML = `<div class="system-msg">${analysis}</div>`;

  // Clean conversation history
  let history = [];

  // Set system behavior
  const followupPrompt = `
You're a friendly, empathetic chat partner.

You get a short image description of a person, object, or scene.

Your only job is to instantly reply with a short, casual question to start a conversation — like a real friend texting.

❌ Do NOT explain your reasoning.
❌ Do NOT analyze or offer options.
✅ Just respond with a single friendly question.

Examples:
- "You look sad." → "Oh no, what happened?"
- "You look happy!" → "You seem super happy—what’s going on?"
- "There’s a cat in the image." → "Aww is that your cat?"
- "You're staring at the camera with a serious face." → "You look deep in thought—what’s on your mind?"

Keep it chill. One line. One question. Like you're just texting your friend.
  `.trim();

  // Inject system prompt
  history.unshift({ role: "system", content: followupPrompt });

  // Inject image description as user message
  history.push({ role: "user", content: analysis });

  // Get first AI message
  const firstAI = await callBotAPI(null, history);
  appendMessage(firstAI.reply, "bot", firstAI.think);
  history.push({ role: "assistant", content: firstAI.reply });

  // Handle user chat input
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = chatInput.value.trim();
    if (!msg) return;

    appendMessage(msg, "user");
    chatInput.value = "";
    history.push({ role: "user", content: msg });

    const botResult = await callBotAPI(null, history);
    appendMessage(botResult.reply, "bot", botResult.think);
    history.push({ role: "assistant", content: botResult.reply });
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });

  // Append message to chat UI
  function appendMessage(text, sender, think = null) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `${sender} message animate-in`;

    if (sender === "bot") {
      msgDiv.innerHTML = marked.parse(text);
    } else {
      msgDiv.textContent = text;
    }

    if (think && think.trim() !== "") {
      const details = document.createElement("details");
      details.className = "think-toggle";
      details.style.marginTop = "10px";
      details.style.cursor = "pointer";
      const summary = document.createElement("summary");
      summary.textContent = "🤔 Show AI's thinking";
      summary.className = "think-summary";
      const thinkText = document.createElement("div");
      thinkText.textContent = think;
      thinkText.className = "think-content";
      details.appendChild(summary);
      details.appendChild(thinkText);
      msgDiv.appendChild(details);
    }

    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    setTimeout(() => {
      msgDiv.classList.remove("animate-in");
    }, 400);
  }

  // API call to backend
  async function callBotAPI(message, history = null) {
    try {
      const res = await fetch("/chat_api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(history ? { history } : { user_message: message }),
      });
      const data = await res.json();
      return {
        reply: data.reply || "Something went wrong!",
        think: data.thinking || "",
      };
    } catch {
      return { reply: "Something went wrong!", think: "" };
    }
  }
});
