let games = [];
let playCounts = {};
let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
let recent = JSON.parse(localStorage.getItem("recent") || "[]");
let maintenance = localStorage.getItem("maintenance") === "true";

let playerName = localStorage.getItem("playerName") || "";
const playerInput = document.getElementById("player-name");

if (playerInput) {
  playerInput.value = playerName;
  playerInput.addEventListener("input", e => {
    playerName = e.target.value.trim();
    localStorage.setItem("playerName", playerName);
  });
}

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

async function loadGames() {
  const res = await fetch("games.json");
  games = await res.json();
  buildGameGrid(games);
  buildFeatured(games);
}

const gameGrid = document.getElementById("gameGrid");

function buildGameGrid(list) {
  if (!gameGrid) return;

  gameGrid.innerHTML = "";

  list.forEach(game => {
    const card = document.createElement("div");
    card.className = "game-card";
    card.innerHTML = `
      <h3>${game.name}</h3>
      <p>${game.category}</p>
    `;
    card.addEventListener("click", () => openViewer(game));
    gameGrid.appendChild(card);
  });
}

const featuredRow = document.getElementById("featuredRow");

function buildFeatured(list) {
  if (!featuredRow) return;

  featuredRow.innerHTML = "";

  list.filter(g => g.featured).forEach(game => {
    const card = document.createElement("div");
    card.className = "game-card";
    card.innerHTML = `<h3>${game.name}</h3>`;
    card.addEventListener("click", () => openViewer(game));
    featuredRow.appendChild(card);
  });
}

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

function toggleFavorite(name) {
  if (favorites.includes(name)) {
    favorites = favorites.filter(f => f !== name);
  } else {
    favorites.push(name);
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

function addRecent(name) {
  recent = recent.filter(r => r !== name);
  recent.unshift(name);
  if (recent.length > 10) recent.pop();
  localStorage.setItem("recent", JSON.stringify(recent));
}

const viewerOverlay = document.getElementById("viewerOverlay");
const viewerTitle = document.getElementById("viewerTitle");
const viewerCategory = document.getElementById("viewerCategory");
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

const aiButton = document.getElementById("aiButton");
const aiModal = document.getElementById("aiModal");
const aiClose = document.getElementById("aiClose");
const aiMessages = document.getElementById("aiMessages");
const aiInput = document.getElementById("aiInput");

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

if (aiInput) {
  aiInput.addEventListener("keydown", e => {
    if (e.key === "Enter" && aiInput.value.trim() !== "") {
      const msg = document.createElement("div");
      msg.textContent = aiInput.value;
      aiMessages.appendChild(msg);
      aiInput.value = "";
      aiMessages.scrollTop = aiMessages.scrollHeight;
    }
  });
}

const maintenanceOverlay = document.getElementById("maintenanceOverlay");

function applyMaintenance() {
  if (maintenance && maintenanceOverlay) {
    maintenanceOverlay.classList.remove("hidden");
  } else if (maintenanceOverlay) {
    maintenanceOverlay.classList.add("hidden");
  }
}

applyMaintenance();

loadPlayCounts();
loadGames();
