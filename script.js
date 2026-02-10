let lockdownData = JSON.parse(localStorage.getItem("lockdownData") || "null");

function applyLockdown() {
  const screen = document.getElementById("lockdownScreen");
  if (!lockdownData) {
    screen.classList.add("hidden");
    return;
  }

  const now = Date.now();
  if (now >= lockdownData.endTime) {
    localStorage.removeItem("lockdownData");
    lockdownData = null;
    screen.classList.add("hidden");
    return;
  }

  screen.classList.remove("hidden");

  document.getElementById("lockMessage").textContent = lockdownData.message;

  function update() {
    const now = Date.now();
    const diff = lockdownData.endTime - now;

    if (diff <= 0) {
      localStorage.removeItem("lockdownData");
      lockdownData = null;
      screen.classList.add("hidden");
      return;
    }

    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);

    document.getElementById("lockTime").textContent =
      "Current Time: " + new Date().toLocaleTimeString();

    document.getElementById("lockCountdown").textContent =
      "Lockdown ends in: " + mins + "m " + secs + "s";
  }

  update();
  setInterval(update, 1000);
}

applyLockdown();

/* AI Upgrade */

const aiMessages = document.getElementById("aiMessages");

function addAiMessage(text, from = "bot") {
  const div = document.createElement("div");
  div.className = "ai-message " + (from === "bot" ? "ai-message-bot" : "ai-message-user");
  div.innerHTML = `<p>${text}</p>`;
  aiMessages.appendChild(div);
  aiMessages.scrollTop = aiMessages.scrollHeight;
}

function aiReply(input) {
  const q = input.toLowerCase();

  if (q.includes("games")) return "You currently have " + games.length + " games installed.";
  if (q.includes("featured")) return "Featured games: " + games.filter(g => g.featured).map(g => g.name).join(", ");
  if (q.includes("category")) return "Categories include: " + [...new Set(games.map(g => g.category))].join(", ");

  return "I can help with games, categories, featured lists, or site info. Ask me anything.";
}

document.getElementById("aiSend").onclick = () => {
  const text = aiInput.value.trim();
  if (!text) return;
  addAiMessage(text, "user");
  aiInput.value = "";
  setTimeout(() => addAiMessage(aiReply(text)), 300);
};
