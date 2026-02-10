let games = [];
let playCounts = {};
let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
let recent = JSON.parse(localStorage.getItem("recent") || "[]");
let maintenance = localStorage.getItem("maintenance") === "true";
let lockdownData = JSON.parse(localStorage.getItem("lockdownData") || "null");

/* Play counts */

function loadPlayCounts() {
  try {
    playCounts = JSON.parse(localStorage.getItem("playCounts") || "{}");
  } catch {
    playCounts = {};
  }
}

function savePlayCounts() {
  localStorage.setItem("playCounts", JSON.stringify(playCounts));
}

/* Games */

async function loadGames() {
  const res = await fetch("games.json");
  let baseGames = await res.json();

  const custom = localStorage.getItem("customGames");
  if (custom) {
    try {
      baseGames = JSON.parse(custom);
    } catch {}
  }

  games = baseGames;
  buildGameGrid(games);
  buildFeatured(games);
}

/* UI builders */

const gameGrid = document.getElementById("gameGrid");
const featuredRow = document.getElementById("featuredRow");

function createGameCard(game) {
  const card = document.createElement("div");
  card.className = "game-card";

  const thumb = document.createElement("div");
  thumb.className = "game-thumb";
  if (game.logo) {
    thumb.style.backgroundImage = `url(${game.logo})`;
  } else {
    thumb.textContent = game.name[0] || "?";
  }

  const title = document.createElement("h3");
  title.textContent = game.name;

  const cat = document.createElement("p");
  cat.textContent = game.category;

  card.appendChild(thumb);
  card.appendChild(title);
  card.appendChild(cat);

  card.addEventListener("click", () => openViewer(game));

  return card;
}

function buildGameGrid(list) {
  if (!gameGrid) return;
  gameGrid.innerHTML = "";
  list.forEach(g => gameGrid.appendChild(createGameCard(g)));
}

function buildFeatured(list) {
  if (!featuredRow) return;
  featuredRow.innerHTML = "";
  list.filter(g => g.featured).forEach(g => featuredRow.appendChild(createGameCard(g)));
}

/* Search & categories */

const searchInput = document.getElementById("searchInput");
if (searchInput) {
  searchInput.addEventListener("input", () => {
    const q = searchInput.value.toLowerCase();
    const filtered = games.filter(g =>
      g.name.toLowerCase().includes(q) ||
      g.category.toLowerCase().includes(q)
    );
    buildGameGrid(filtered);
  });
}

const categorySelect = document.getElementById("categorySelect");
if (categorySelect) {
  categorySelect.addEventListener("change", () => {
    const cat = categorySelect.value;

    if (cat === "all") return buildGameGrid(games);
    if (cat === "favorites") return buildGameGrid(games.filter(g => favorites.includes(g.name)));
    if (cat === "recent") return buildGameGrid(games.filter(g => recent.includes(g.name)));

    buildGameGrid(games.filter(g => g.category === cat));
  });
}

/* Recent */

function addRecent(name) {
  recent = recent.filter(r => r !== name);
  recent.unshift(name);
  if (recent.length > 10) recent.pop();
  localStorage.setItem("recent", JSON.stringify(recent));
}

/* Viewer */

const viewerOverlay = document.getElementById("viewerOverlay");
const viewerTitle = document.getElementById("viewerTitle");
const viewerFrame = document.getElementById("viewerFrame");
const viewerClose = document.getElementById("viewerClose");

function openViewer(game) {
  viewerTitle.textContent = game.name;
  viewerFrame.src = game.url;
  viewerOverlay.classList.remove("hidden");

  playCounts[game.name] = (playCounts[game.name] || 0) + 1;
  savePlayCounts();
  addRecent(game.name);
}

if (viewerClose) {
  viewerClose.addEventListener("click", () => {
    viewerOverlay.classList.add("hidden");
    viewerFrame.src = "";
  });
}

/* Maintenance */

const maintenanceStatus = document.getElementById("maintenanceStatus");

function applyMaintenance() {
  if (!maintenanceStatus) return;
  if (maintenance) {
    maintenanceStatus.textContent = "Maintenance";
    maintenanceStatus.classList.add("offline");
  } else {
    maintenanceStatus.textContent = "Online";
    maintenanceStatus.classList.remove("offline");
  }
}

/* Lockdown (homepage only) */

function applyLockdown() {
  const screen = document.getElementById("lockdownScreen");
  if (!screen) return;

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
  document.getElementById("lockMessage").textContent = lockdownData.message || "";

  function update() {
    if (!lockdownData) return;
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

/* AI Copilot (with math) */

const aiButton = document.getElementById("aiButton");
const aiModal = document.getElementById("aiModal");
const aiClose = document.getElementById("aiClose");
const aiMessages = document.getElementById("aiMessages");
const aiInput = document.getElementById("aiInput");
const aiSend = document.getElementById("aiSend");

function addAiMessage(text, from = "bot") {
  const div = document.createElement("div");
  div.className = "ai-message " + (from === "bot" ? "ai-message-bot" : "ai-message-user");
  div.innerHTML = `<p>${text}</p>`;
  aiMessages.appendChild(div);
  aiMessages.scrollTop = aiMessages.scrollHeight;
}

function isMathExpression(str) {
  return /^[0-9+\-*/().\s^]+$/.test(str);
}

function solveMath(expr) {
  try {
    const safe = expr.replace(/\^/g, "**");
    // basic eval for K–12 style arithmetic
    // eslint-disable-next-line no-eval
    const result = eval(safe);
    if (typeof result === "number" && isFinite(result)) {
      return "The answer is: " + result;
    }
    return "That expression doesn't look valid.";
  } catch {
    return "I couldn't evaluate that expression.";
  }
}

function aiReply(input) {
  const q = input.trim();
  const lower = q.toLowerCase();

  if (isMathExpression(q)) {
    return solveMath(q);
  }

  if (lower.includes("games")) {
    return "You currently have " + games.length + " games installed.";
  }

  if (lower.includes("featured")) {
    const names = games.filter(g => g.featured).map(g => g.name).join(", ") || "No featured games yet.";
    return "Featured games: " + names;
  }

  if (lower.includes("category")) {
    const cats = [...new Set(games.map(g => g.category))].join(", ");
    return "Available categories: " + cats;
  }

  if (lower.startsWith("search ")) {
    const term = lower.replace("search ", "").trim();
    const matches = games.filter(g => g.name.toLowerCase().includes(term));
    if (!matches.length) return `I couldn't find any games matching "${term}".`;
    return `I found ${matches.length} game(s): ${matches.map(g => g.name).join(", ")}.`;
  }

  return "I can solve math (K–12), list games, show categories, and help you explore BLK Games. Try a math problem or ask about games.";
}

if (aiButton) {
  aiButton.addEventListener("click", () => {
    aiModal.classList.remove("hidden");
    if (!aiMessages.children.length) {
      addAiMessage("Hey, I’m BLK Copilot. Ask me a math problem or anything about your games.");
    }
  });
}

if (aiClose) {
  aiClose.addEventListener("click", () => {
    aiModal.classList.add("hidden");
  });
}

function sendAi() {
  const text = aiInput.value.trim();
  if (!text) return;
  addAiMessage(text, "user");
  aiInput.value = "";
  setTimeout(() => addAiMessage(aiReply(text), "bot"), 250);
}

if (aiSend) {
  aiSend.addEventListener("click", sendAi);
}

if (aiInput) {
  aiInput.addEventListener("keydown", e => {
    if (e.key === "Enter") sendAi();
  });
}

/* Init */

loadPlayCounts();
loadGames();
applyMaintenance();
applyLockdown();
