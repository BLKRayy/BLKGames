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

// Lockdown overlay
function applyLockdown() {
  const screen = document.getElementById("lockdownScreen");
  if (!screen) return;

  const data = JSON.parse(localStorage.getItem("lockdownData") || "null");
  if (!data) {
    screen.classList.add("hidden");
    return;
  }

  function update() {
    const now = Date.now();
    if (now >= data.endTime) {
      localStorage.removeItem("lockdownData");
      screen.classList.add("hidden");
      return;
    }

    const diff = data.endTime - now;
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);

    document.getElementById("lockMessage").textContent = data.message;
    document.getElementById("lockTime").textContent =
      "Current Time: " + new Date().toLocaleTimeString();
    document.getElementById("lockCountdown").textContent =
      "Lockdown ends in: " + mins + "m " + secs + "s";
  }

  screen.classList.remove("hidden");
  update();
  setInterval(update, 1000);
}

// Events
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");

  if (searchInput) searchInput.addEventListener("input", renderGames);
  if (categoryFilter) categoryFilter.addEventListener("change", renderGames);

  loadGames();
  applyMaintenanceStatus();
  applyLockdown();
});
