// ===== LOGIN =====
const adminLogin = document.getElementById("adminLogin");
const adminDashboard = document.getElementById("adminDashboard");
const adminUser = document.getElementById("adminUser");
const adminPass = document.getElementById("adminPass");
const adminLoginBtn = document.getElementById("adminLoginBtn");
const adminLogout = document.getElementById("adminLogout");

adminLoginBtn.addEventListener("click", () => {
  if (adminUser.value === "admin" && adminPass.value === "loyal") {
    adminLogin.classList.add("hidden");
    adminDashboard.classList.remove("hidden");
    loadAdminData();
    updateStatusPanel();
  } else {
    alert("Incorrect username or password.");
  }
});

adminLogout.addEventListener("click", () => {
  window.location.href = "index.html";
});

// ===== PAGE SWITCHING =====
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

// ===== MAINTENANCE =====
const toggleMaintenance = document.getElementById("toggleMaintenance");

toggleMaintenance.addEventListener("click", () => {
  const current = localStorage.getItem("maintenance") === "true";
  localStorage.setItem("maintenance", (!current).toString());
  alert("Maintenance mode updated.");
  updateStatusPanel();
});

// ===== GLOBAL LOCKDOWN (URL-BASED) =====
startLockdown.addEventListener("click", () => {
  const msg =
    lockdownMessageInput.value.trim() ||
    "Access Has Been Disabled by the Administrator";
  const mins = parseInt(lockdownMinutes.value) || 30;

  const endTime = Date.now() + mins * 60000;

  const base = "https://blkrayy.github.io/BLKGames/";
  const url =
    base +
    `?lockdown=1&end=${endTime}&msg=${encodeURIComponent(msg)}`;

  alert("Lockdown activated. Redirecting now.");
  window.location.href = url;
});

clearLockdown.addEventListener("click", () => {
  localStorage.removeItem("globalLockdown");
  alert("Lockdown cleared on this device. Other devices must refresh.");
});


// ===== IMPORT / EXPORT JSON =====
const jsonBox = document.getElementById("jsonBox");
const exportJSON = document.getElementById("exportJSON");
const importJSON = document.getElementById("importJSON");
const resetDefaults = document.getElementById("resetDefaults");
const clearAll = document.getElementById("clearAll");

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

resetDefaults.addEventListener("click", () => {
  localStorage.removeItem("customGames");
  alert("Reset to default games.json.");
  updateStatusPanel();
});

clearAll.addEventListener("click", () => {
  localStorage.clear();
  alert("All local data cleared.");
  updateStatusPanel();
});

// ===== QUICK IMPORT GAME =====
const importURL = document.getElementById("importURL");
const importName = document.getElementById("importName");
const importImg = document.getElementById("importImg");
const importBtn = document.getElementById("importBtn");

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

// ===== LOGS =====
const logViewer = document.getElementById("logViewer");

function loadLogs() {
  const logs = JSON.parse(localStorage.getItem("playCounts") || "{}");
  logViewer.innerHTML = Object.keys(logs).length
    ? Object.keys(logs)
        .map(name => `<p>${name}: ${logs[name]} plays</p>`)
        .join("")
    : "<p>No play data yet.</p>";
}

// ===== FEATURED EDITOR =====
const featuredEditor = document.getElementById("featuredEditor");

function loadFeaturedEditor() {
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
        .map(
          g => `
          <label style="display:block;margin:6px 0;">
            <input type="checkbox" data-name="${g.name}" ${
            g.featured ? "checked" : ""
          }>
            ${g.name}
          </label>
        `
        )
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

// ===== GAME EDITOR =====
const gameEditor = document.getElementById("gameEditor");

function loadGameEditor() {
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
              .map(
                g => `
                <div style="padding:10px;border:1px solid #1f2937;margin:8px 0;border-radius:8px;">
                  <strong>${g.name}</strong> <small>(${g.category})</small><br>
                  <small>${g.url}</small><br>
                  <button data-delete="${g.name}" style="margin-top:4px;color:#fca5a5;">Delete</button>
                </div>
              `
              )
              .join("")
          : "<p>No games defined.</p>";

        gameEditor.querySelectorAll("[data-delete]").forEach(btn => {
          btn.addEventListener("click", () => {
            const name = btn.getAttribute("data-delete");
            const filtered = data.filter(g => g.name !== name);
            data.length = 0;
            filtered.forEach(x => data.push(x));
            localStorage.setItem("customGames", JSON.stringify(data));
            render();
          });
        });
      }

      render();
    });
}

// ===== STATUS PANEL =====
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

  statusOnline.textContent =
    "Online status: " + (maintenance ? "Maintenance" : "Online");
  statusLockdown.textContent = lockdownData
    ? "Lockdown: ACTIVE (ends " +
      new Date(lockdownData.endTime).toLocaleTimeString() +
      ")"
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

// ===== AI HELPER (MATH) =====
const aiQuestion = document.getElementById("aiQuestion");
const aiSolve = document.getElementById("aiSolve");
const aiAnswer = document.getElementById("aiAnswer");

aiSolve.addEventListener("click", () => {
  const q = (aiQuestion.value || "").trim();
  if (!q) {
    aiAnswer.textContent = "Please type a math expression.";
    return;
  }

  try {
    // Very simple numeric expression solver (K–12 style arithmetic)
    // Example: 3 + 4 * 2, (10 - 3) / 7, etc.
    const result = Function(`"use strict"; return (${q});`)();
    if (typeof result === "number" && isFinite(result)) {
      aiAnswer.textContent = `Answer: ${result}`;
    } else {
      aiAnswer.textContent =
        "I can only solve numeric expressions (no words yet).";
    }
  } catch {
    aiAnswer.textContent =
      "I couldn't understand that. Try a numeric expression like 3 + 4 * 2.";
  }
});

// ===== LOAD ALL AFTER LOGIN =====
function loadAdminData() {
  loadLogs();
  loadFeaturedEditor();
  loadGameEditor();
  updateStatusPanel();
}
