// ===== LOGIN =====
const loginBox = document.getElementById("loginBox");
const adminPanel = document.getElementById("adminPanel");
const loginBtn = document.getElementById("loginBtn");

loginBtn.onclick = () => {
  const u = document.getElementById("user").value.trim();
  const p = document.getElementById("pass").value.trim();

  if (u === "admin" && p === "loyal") {
    loginBox.classList.add("hidden");
    adminPanel.classList.remove("hidden");
    loadAdminData();
  } else {
    alert("Incorrect login.");
  }
};

// ===== LOAD DATA =====
let games = [];

function loadAdminData() {
  fetch("games.json")
    .then(r => r.json())
    .then(data => {
      const custom = localStorage.getItem("customGames");
      games = custom ? JSON.parse(custom) : data;
      renderFeaturedEditor();
      renderGameEditor();
      loadMaintenance();
      loadLockdown();
    });
}

// ===== FEATURED EDITOR =====
function renderFeaturedEditor() {
  const box = document.getElementById("featuredEditor");
  box.innerHTML = "";

  games.forEach(g => {
    const row = document.createElement("div");
    row.className = "admin-row";

    row.innerHTML = `
      <span>${g.name}</span>
      <input type="checkbox" data-name="${g.name}" ${g.featured ? "checked" : ""}>
    `;

    row.querySelector("input").onchange = e => {
      const name = e.target.getAttribute("data-name");
      const updated = games.map(x =>
        x.name === name ? { ...x, featured: e.target.checked } : x
      );
      games = updated;
      localStorage.setItem("customGames", JSON.stringify(updated));
    };

    box.appendChild(row);
  });
}

// ===== GAME EDITOR =====
function renderGameEditor() {
  const box = document.getElementById("gameEditor");
  box.innerHTML = "";

  games.forEach(g => {
    const row = document.createElement("div");
    row.className = "admin-row";

    row.innerHTML = `
      <span>${g.name}</span>
      <button data-url="${g.url}" class="editBtn">Edit</button>
    `;

    row.querySelector(".editBtn").onclick = () => editGame(g.url);
    box.appendChild(row);
  });
}

function editGame(url) {
  const g = games.find(x => x.url === url);
  if (!g) return;

  const name = prompt("Game name:", g.name);
  if (!name) return;

  const cat = prompt("Category:", g.category);
  if (!cat) return;

  const logo = prompt("Logo URL:", g.logo || "");
  const newUrl = prompt("Game URL:", g.url);

  const updated = games.map(x =>
    x.url === url
      ? { ...x, name, category: cat, logo, url: newUrl }
      : x
  );

  games = updated;
  localStorage.setItem("customGames", JSON.stringify(updated));
  renderGameEditor();
  renderFeaturedEditor();
}

// ===== IMPORT / EXPORT =====
document.getElementById("exportBtn").onclick = () => {
  const blob = new Blob([JSON.stringify(games, null, 2)], {
    type: "application/json"
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "games-export.json";
  a.click();
};

document.getElementById("importBtn").onclick = () => {
  const file = document.getElementById("importFile").files[0];
  if (!file) return alert("Choose a file first.");

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      games = data;
      localStorage.setItem("customGames", JSON.stringify(data));
      renderFeaturedEditor();
      renderGameEditor();
      alert("Import complete.");
    } catch {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(file);
};

// ===== MAINTENANCE =====
function loadMaintenance() {
  const m = localStorage.getItem("maintenance") === "true";
  document.getElementById("maintToggle").checked = m;
}

document.getElementById("maintToggle").onchange = e => {
  localStorage.setItem("maintenance", e.target.checked);
};

// ===== GLOBAL LOCKDOWN =====
function loadLockdown() {
  const data = JSON.parse(localStorage.getItem("globalLockdown") || "null");
  if (!data) return;

  document.getElementById("lockMsg").value = data.msg;
  document.getElementById("lockMinutes").value = data.minutes;
}

document.getElementById("lockBtn").onclick = () => {
  const msg = document.getElementById("lockMsg").value.trim();
  const minutes = parseInt(document.getElementById("lockMinutes").value);

  if (!msg || !minutes) return alert("Fill out both fields.");

  const end = Date.now() + minutes * 60000;

  localStorage.setItem(
    "globalLockdown",
    JSON.stringify({ msg, minutes, end })
  );

  alert("Lockdown activated.");
};

document.getElementById("unlockBtn").onclick = () => {
  localStorage.removeItem("globalLockdown");
  alert("Lockdown removed.");
};
