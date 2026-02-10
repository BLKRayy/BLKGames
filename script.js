// Load games and render homepage
let gamesData = [];

function loadGames() {
  fetch("games.json")
    .then(res => res.json())
    .then(data => {
      const custom = localStorage.getItem("customGames");
      if (custom) {
        try {
          data = JSON.parse(custom);
        } catch {}
      }
      gamesData = data;
      populateCategories();
      renderGames();
    });
}

function populateCategories() {
  const select = document.getElementById("categoryFilter");
  if (!select) return;
  const cats = new Set(["All"]);
  gamesData.forEach(g => cats.add(g.category || "Other"));
  select.innerHTML = "";
  cats.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c + (c === "All" ? " Games" : "");
    select.appendChild(opt);
  });
}

function renderGames() {
  const featuredContainer = document.getElementById("featuredGames");
  const allContainer = document.getElementById("allGames");
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");

  if (!featuredContainer || !allContainer) return;

  const query = (searchInput?.value || "").toLowerCase();
  const category = categoryFilter?.value || "All";

  const filtered = gamesData.filter(g => {
    const matchesSearch =
      g.name.toLowerCase().includes(query) ||
      (g.category || "").toLowerCase().includes(query);
    const matchesCategory =
      category === "All" || (g.category || "Other") === category;
    return matchesSearch && matchesCategory;
  });

  const featured = filtered.filter(g => g.featured);
  const nonFeatured = filtered;

  featuredContainer.innerHTML = featured
    .map(
      g => `<button class="game-pill" onclick="openGame('${encodeURIComponent(
        g.url
      )}')">${g.name}</button>`
    )
    .join("");

  allContainer.innerHTML = nonFeatured
    .map(
      g => `
      <div class="game-row" onclick="openGame('${encodeURIComponent(g.url)}')">
        <span>${g.name}</span>
        <span>${g.category || "Other"}</span>
      </div>`
    )
    .join("");
}

function openGame(urlEncoded) {
  const url = decodeURIComponent(urlEncoded);
  window.open(url, "_blank");

  const playCounts = JSON.parse(localStorage.getItem("playCounts") || "{}");
  const name = gamesData.find(g => g.url === url)?.name || url;
  playCounts[name] = (playCounts[name] || 0) + 1;
  localStorage.setItem("playCounts", JSON.stringify(playCounts));
}

// Maintenance indicator
function applyMaintenanceStatus() {
  const pill = document.getElementById("maintenanceStatus");
  if (!pill) return;
  const maintenance = localStorage.getItem("maintenance") === "true";
  if (maintenance) {
    pill.textContent = "Maintenance";
    pill.style.background = "#451a03";
    pill.style.color = "#fed7aa";
  } else {
    pill.textContent = "Online";
    pill.style.background = "#022c22";
    pill.style.color = "#6ee7b7";
  }
}

// =========================
// GLOBAL LOCKDOWN SYSTEM
// =========================

const lockdownScreen = document.getElementById("lockdownScreen");
const lockMessage = document.getElementById("lockMessage");
const lockTime = document.getElementById("lockTime");
const lockCountdown = document.getElementById("lockCountdown");

let lockdownInterval = null;

function applyGlobalLockdown(data) {
  if (!data) {
    lockdownScreen.classList.add("hidden");
    if (lockdownInterval) clearInterval(lockdownInterval);
    return;
  }

  lockdownScreen.classList.remove("hidden");

  function update() {
    const now = Date.now();
    if (now >= data.end) {
      clearInterval(lockdownInterval);
      localStorage.removeItem("globalLockdown");
      lockdownScreen.classList.add("hidden");
      return;
    }

    const diff = data.end - now;
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);

    lockMessage.textContent = data.msg;
    lockTime.textContent = "Current Time: " + new Date().toLocaleTimeString();
    lockCountdown.textContent = `Lockdown ends in: ${mins}m ${secs}s`;
  }

  update();
  lockdownInterval = setInterval(update, 1000);
}

function readLockdownFromURL() {
  const params = new URLSearchParams(window.location.search);
  const isLock = params.get("lockdown");
  const end = params.get("end");
  const msg = params.get("msg");

  if (isLock === "1" && end) {
    const data = {
      end: parseInt(end, 10),
      msg: decodeURIComponent(msg || "Access Has Been Disabled by the Administrator")
    };

    localStorage.setItem("globalLockdown", JSON.stringify(data));
    applyGlobalLockdown(data);
    return;
  }

  const stored = localStorage.getItem("globalLockdown");
  if (stored) {
    try {
      const data = JSON.parse(stored);
      if (data.end > Date.now()) {
        applyGlobalLockdown(data);
      } else {
        localStorage.removeItem("globalLockdown");
        applyGlobalLockdown(null);
      }
    } catch {
      localStorage.removeItem("globalLockdown");
      applyGlobalLockdown(null);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  readLockdownFromURL();
});
const overrideBtn = document.getElementById("lockdownOverrideBtn");
if (overrideBtn) {
  overrideBtn.addEventListener("click", () => {
    window.location.href = "admin.html";
  });
}



// =========================
// HOMEPAGE AI SYSTEM
// =========================

const aiButton = document.getElementById("aiButton");
const aiModal = document.getElementById("aiModal");
const aiClose = document.getElementById("aiClose");
const aiMessages = document.getElementById("aiMessages");
const aiInput = document.getElementById("aiInput");
const aiSend = document.getElementById("aiSend");
const aiMic = document.getElementById("aiMic");

let aiMemory = [];

function addAiMessage(text, from = "bot") {
  const div = document.createElement("div");
  div.className = "ai-msg " + (from === "bot" ? "ai-bot" : "ai-user");
  div.textContent = text;
  aiMessages.appendChild(div);
  aiMessages.scrollTop = aiMessages.scrollHeight;
}

function addTyping() {
  const wrap = document.createElement("div");
  wrap.className = "ai-msg ai-bot";
  wrap.id = "aiTyping";
  wrap.innerHTML = `
    <div class="ai-typing">
      <div></div><div></div><div></div>
    </div>
  `;
  aiMessages.appendChild(wrap);
  aiMessages.scrollTop = aiMessages.scrollHeight;
}

function removeTyping() {
  const t = document.getElementById("aiTyping");
  if (t) t.remove();
}

function solveMath(expr) {
  try {
    const result = Function(`"use strict"; return (${expr});`)();
    if (typeof result === "number" && isFinite(result)) return result;
    return "I can only solve numeric expressions.";
  } catch {
    return "I couldn't understand that expression.";
  }
}

function aiReply(input) {
  const q = input.trim();
  aiMemory.push(q);

  if (/^[0-9+\-*/().\s^]+$/.test(q)) {
    return "Answer: " + solveMath(q);
  }

  if (q.toLowerCase().includes("games")) {
    return "You currently have " + gamesData.length + " games installed.";
  }

  if (q.toLowerCase().includes("remember")) {
    aiMemory.push("memory:" + q);
    return "Okay, I'll remember that for this session.";
  }

  return "I can solve math, answer questions, remember things for this session, and help you explore BLK Games.";
}

function sendAi() {
  const text = aiInput.value.trim();
  if (!text) return;

  addAiMessage(text, "user");
  aiInput.value = "";

  addTyping();

  setTimeout(() => {
    removeTyping();
    addAiMessage(aiReply(text), "bot");
  }, 600);
}

aiButton.addEventListener("click", () => {
  aiModal.classList.remove("hidden");
  if (!aiMessages.children.length) {
    addAiMessage("Hey, I'm BLK Copilot. Ask me anything!", "bot");
  }
});

aiClose.addEventListener("click", () => aiModal.classList.add("hidden"));
aiSend.addEventListener("click", sendAi);

aiInput.addEventListener("keydown", e => {
  if (e.key === "Enter") sendAi();
});

// Draggable AI window
let isDragging = false;
let offsetX = 0;
let offsetY = 0;

aiModal.querySelector(".ai-header").addEventListener("mousedown", e => {
  isDragging = true;
  offsetX = e.clientX - aiModal.offsetLeft;
  offsetY = e.clientY - aiModal.offsetTop;
});

document.addEventListener("mouseup", () => (isDragging = false));

document.addEventListener("mousemove", e => {
  if (isDragging) {
    aiModal.style.left = e.clientX - offsetX + "px";
    aiModal.style.top = e.clientY - offsetY + "px";
  }
});

// Voice input
aiMic.addEventListener("click", () => {
  const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  rec.lang = "en-US";
  rec.start();

  rec.onresult = e => {
    aiInput.value = e.results[0][0].transcript;
    sendAi();
  };
});
