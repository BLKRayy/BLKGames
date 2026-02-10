let games = [];
let playCounts = {};
let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
let recent = JSON.parse(localStorage.getItem("recent") || "[]");
let maintenance = localStorage.getItem("maintenance") === "true";
let lockdownData = JSON.parse(localStorage.getItem("lockdownData") || "null");

/* Load play counts */

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

/* Load games (with custom override) */

async function loadGames() {
  const res = await fetch("games.json");
  let baseGames = await res.json();

  const custom = localStorage.getItem("customGames");
  if (custom) {
    try {
      baseGames = JSON.parse(custom);
    } catch {
      // ignore
    }
  }

  games = baseGames;
  buildGameGrid(games);
  buildFeatured(games);
}

/* Build UI */

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
  list.forEach(game => gameGrid.appendChild(createGameCard(game)));
}

function buildFeatured(list) {
  if (!featuredRow) return;
  featuredRow.innerHTML = "";
  list.filter(g => g.featured).forEach(game => {
    featuredRow.appendChild(createGameCard(game));
  });
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

/* Favorites & recent */

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

/* AI Copilot-like chat */

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

function handleAiQuery(q) {
  const lower = q.toLowerCase();

  if (lower.includes("featured")) {
    const names = games.filter(g => g.featured).map(g => g.name).join(", ") || "No featured games yet.";
    return `Featured games right now: ${names}`;
  }

  if (lower.includes("categories") || lower.includes("category")) {
    const cats = [...new Set(games.map(g => g.category))].join(", ");
    return `Available categories: ${cats}`;
  }

  if (lower.startsWith("search ")) {
    const term = lower.replace("search ", "").trim();
    const matches = games.filter(g => g.name.toLowerCase().includes(term));
    if (!matches.length) return `I couldn't find any games matching "${term}".`;
    return `I found ${matches.length} game(s): ${matches.map(g => g.name).join(", ")}.`;
  }

  return "I’m still learning, but I can help with featured games, categories, or searching (try: “search run”).";
}

if (aiButton) {
  aiButton.addEventListener("click", () => {
    aiModal.classList.remove("hidden");
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
  const reply = handleAiQuery(text);
  setTimeout(() => addAiMessage(reply, "bot"), 300);
}

if (aiSend) {
  aiSend.addEventListener("click", sendAi);
}

if (aiInput) {
  aiInput.addEventListener("keydown", e => {
    if (e.key === "Enter") sendAi();
  });
}

/* Maintenance + lockdown */

const maintenanceOverlay = document.getElementById("maintenanceOverlay");
const maintenanceStatus = document.getElementById("maintenanceStatus");
const lockdownBanner = document.getElementById("lockdownBanner");
const lockdownTimer = document.getElementById("lockdownTimer");

function applyMaintenance() {
  if (!maintenanceOverlay || !maintenanceStatus) return;

  if (maintenance) {
    maintenanceOverlay.classList.remove("hidden");
    maintenanceStatus.textContent = "Maintenance";
    maintenanceStatus.classList.add("offline");
  } else {
    maintenanceOverlay.classList.add("hidden");
    maintenanceStatus.textContent = "Online";
    maintenanceStatus.classList.remove("offline");
  }
}

function applyLockdown() {
  if (!lockdownBanner || !lockdownTimer) return;

  if (!lockdownData) {
    lockdownBanner.style.display = "none";
    return;
  }

  const now = Date.now();
  const end = lockdownData.endTime;
  if (now >= end) {
    lockdownData = null;
    localStorage.removeItem("lockdownData");
    lockdownBanner.style.display = "none";
    return;
  }

  lockdownBanner.style.display = "block";

  function updateCountdown() {
    const now = Date.now();
    const diff = end - now;
    if (diff <= 0) {
      lockdownBanner.style.display = "none";
      localStorage.removeItem("lockdownData");
      lockdownData = null;
      return;
    }
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    lockdownTimer.textContent = `Ends in ${mins}m ${secs}s`;
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

loadPlayCounts();
loadGames();
applyMaintenance();
applyLockdown();
