/* Login */

const adminLogin = document.getElementById("adminLogin");
const adminDashboard = document.getElementById("adminDashboard");

const adminUser = document.getElementById("adminUser");
const adminPass = document.getElementById("adminPass");
const adminLoginBtn = document.getElementById("adminLoginBtn");
const adminLogout = document.getElementById("adminLogout");

if (adminLoginBtn) {
  adminLoginBtn.addEventListener("click", () => {
    if (adminUser.value === "admin" && adminPass.value === "loyal") {
      adminLogin.classList.add("hidden");
      adminDashboard.classList.remove("hidden");
      updateStatusPanel();
      loadAdminData();
    } else {
      alert("Incorrect username or password.");
    }
  });
}

if (adminLogout) {
  adminLogout.addEventListener("click", () => {
    window.location.href = "index.html";
  });
}

/* Page switching */

const pages = document.querySelectorAll(".admin-page");
const sidebarButtons = document.querySelectorAll(".admin-sidebar button[data-page]");

sidebarButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-page");
    sidebarButtons.forEach(b => b.classList.remove("active-tab"));
    btn.classList.add("active-tab");
    pages.forEach(p => p.classList.remove("active"));
    document.getElementById(`page-${target}`).classList.add("active");
  });
});

/* Maintenance */

const toggleMaintenance = document.getElementById("toggleMaintenance");
if (toggleMaintenance) {
  toggleMaintenance.addEventListener("click", () => {
    const current = localStorage.getItem("maintenance") === "true";
    localStorage.setItem("maintenance", (!current).toString());
    alert("Maintenance mode updated.");
    updateStatusPanel();
  });
}

/* Lockdown */

const lockdownMessageInput = document.getElementById("lockdownMessageInput");
const lockdownMinutes = document.getElementById("lockdownMinutes");
const startLockdown = document.getElementById("startLockdown");
const clearLockdown = document.getElementById("clearLockdown");

if (startLockdown) {
  startLockdown.addEventListener("click", () => {
    const mins = parseInt(lockdownMinutes.value, 10) || 30;
    const msg = lockdownMessageInput.value.trim() || "Server is locked.";
    const endTime = Date.now() + mins * 60000;
    const data = { message: msg, endTime };
    localStorage.setItem("lockdownData", JSON.stringify(data));
    alert("Lockdown started.");
    updateStatusPanel();
  });
}

if (clearLockdown) {
  clearLockdown.addEventListener("click", () => {
    localStorage.removeItem("lockdownData");
    alert("Lockdown cleared.");
    updateStatusPanel();
  });
}

/* Import / export */

const jsonBox = document.getElementById("jsonBox");
const importJSON = document.getElementById("importJSON");
const exportJSON = document.getElementById("exportJSON");
const resetDefaults = document.getElementById("resetDefaults");
const clearAll = document.getElementById("clearAll");

if (exportJSON) {
  exportJSON.addEventListener("click", () => {
    fetch("games.json")
      .then(res => res.json())
      .then(data => {
        const custom = localStorage.getItem("customGames");
        if (custom) {
          try {
            data = JSON.parse(custom);
          } catch {}
        }
        jsonBox.value = JSON.stringify(data, null, 2);
      });
  });
}

if (importJSON) {
  importJSON.addEventListener("click", () => {
    try {
      const parsed = JSON.parse(jsonBox.value);
      localStorage.setItem("customGames", JSON.stringify(parsed));
      alert("Imported successfully. Refresh main site to see changes.");
      updateStatusPanel();
    } catch {
      alert("Invalid JSON.");
    }
  });
}

if (resetDefaults) {
  resetDefaults.addEventListener("click", () => {
    localStorage.removeItem("customGames");
    alert("Reset to default games.json.");
    updateStatusPanel();
  });
}

if (clearAll) {
  clearAll.addEventListener("click", () => {
    localStorage.clear();
    alert("All local data cleared.");
    updateStatusPanel();
  });
}

/* Quick Import Game (URL, Name, Image URL, Import) */

const importURL = document.getElementById("importURL");
const importName = document.getElementById("importName");
const importImg = document.getElementById("importImg");
const importBtn = document.getElementById("importBtn");

if (importBtn) {
  importBtn.addEventListener("click", () => {
    const url = importURL.value.trim();
    const name = importName.value.trim();
    const img = importImg.value.trim();

    if (!url || !name) {
      alert("Game URL and Name are required.");
      return;
    }

    let custom = [];
    const existing = localStorage.getItem("customGames");
    if (existing) {
      try {
        custom = JSON.parse(existing);
      } catch {}
    }

    custom.push({
      name,
      url,
      logo: img,
      category: "Custom",
      featured: false
    });

    localStorage.setItem("customGames", JSON.stringify(custom));
    alert("Game imported.");
    importURL.value = "";
    importName.value = "";
    importImg.value = "";
    updateStatusPanel();
  });
}

/* Logs */

const logViewer = document.getElementById("logViewer");

function loadLogs() {
  if (!logViewer) return;
  const logs = JSON.parse(localStorage.getItem("playCounts") || "{}");
  logViewer.innerHTML = Object.keys(logs).length
    ? Object.keys(logs)
        .map(name => `<p>${name}: ${logs[name]} plays</p>`)
        .join("")
    : "<p>No play data yet.</p>";
}

/* Featured editor */

const featuredEditor = document.getElementById("featuredEditor");

function loadFeaturedEditor() {
  if (!featuredEditor) return;
  fetch("games.json")
    .then(res => res.json())
    .then(data => {
      const custom = localStorage.getItem("customGames");
      if (custom) {
        try {
          data = JSON.parse(custom);
        } catch {}
      }

      featuredEditor.innerHTML = data
        .map(g => `
          <label style="display:block;margin:6px 0;">
            <input type="checkbox" data-name="${g.name}" ${g.featured ? "checked" : ""}>
            ${g.name}
          </label>
        `)
        .join("");

      featuredEditor.querySelectorAll("input").forEach(box => {
        box.addEventListener("change", () => {
          const name = box.getAttribute("data-name");
          const featured = box.checked;
          const updated = data.map(g =>
            g.name === name ? { ...g, featured } : g
          );
          localStorage.setItem("customGames", JSON.stringify(updated));
          data = updated;
        });
      });
    });
}

/* Game editor */

const gameEditor = document.getElementById("gameEditor");

function loadGameEditor() {
  if (!gameEditor) return;
  fetch("games.json")
    .then(res => res.json())
    .then(data => {
      const custom = localStorage.getItem("customGames");
      if (custom) {
        try {
          data = JSON.parse(custom);
        } catch {}
      }

      function render() {
        gameEditor.innerHTML = data.length
          ? data
              .map(g => `
                <div style="padding:10px;border:1px solid #1f2937;margin:8px 0;border-radius:8px;">
                  <strong>${g.name}</strong> <small>(${g.category})</small><br>
                  <small>${g.url}</small><br>
                  <button data-delete="${g.name}" style="margin-top:4px;color:#fca5a5;">Delete</button>
                </div>
              `)
              .join("")
          : "<p>No games defined.</p>";

        gameEditor.querySelectorAll("[data-delete]").forEach(btn => {
          btn.addEventListener("click", () => {
            const name = btn.getAttribute("data-delete");
            data = data.filter(g => g.name !== name);
            localStorage.setItem("customGames", JSON.stringify(data));
            render();
          });
        });
      }

      render();
    });
}

/* Status panel */

function updateStatusPanel() {
  const statusOnline = document.getElementById("statusOnline");
  const statusLockdown = document.getElementById("statusLockdown");
  const statusGames = document.getElementById("statusGames");
  const statusPlays = document.getElementById("statusPlays");
  const statusUpdated = document.getElementById("statusUpdated");

  if (!statusOnline) return;

  const maintenance = localStorage.getItem("maintenance") === "true";
  const lockdownData = JSON.parse(localStorage.getItem("lockdownData") || "null");
  const playCounts = JSON.parse(localStorage.getItem("playCounts") || "{}");

  statusOnline.textContent = "Online status: " + (maintenance ? "Maintenance" : "Online");
  statusLockdown.textContent = lockdownData
    ? "Lockdown: ACTIVE (ends " + new Date(lockdownData.endTime).toLocaleTimeString() + ")"
    : "Lockdown: Inactive";

  fetch("games.json")
    .then(res => res.json())
    .then(data => {
      const custom = localStorage.getItem("customGames");
      if (custom) {
        try {
          data = JSON.parse(custom);
        } catch {}
      }
      statusGames.textContent = "Total games: " + data.length;
    });

  const totalPlays = Object.values(playCounts).reduce((a, b) => a + b, 0);
  statusPlays.textContent = "Total plays: " + totalPlays;
  statusUpdated.textContent = "Last updated: " + new Date().toLocaleTimeString();
}

/* Load all admin data after login */

function loadAdminData() {
  loadLogs();
  loadFeaturedEditor();
  loadGameEditor();
  updateStatusPanel();
}
