/* ===========================
   ADMIN LOGIN
=========================== */

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
    } else {
      alert("Incorrect username or password.");
    }
  });
}

if (adminLogout) {
  adminLogout.addEventListener("click", () => {
    adminDashboard.classList.add("hidden");
    adminLogin.classList.remove("hidden");
  });
}

/* ===========================
   PAGE SWITCHING
=========================== */

const pages = document.querySelectorAll(".admin-page");
const sidebarButtons = document.querySelectorAll(".admin-sidebar button[data-page]");

sidebarButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-page");

    pages.forEach(p => p.classList.remove("active"));
    document.getElementById(`page-${target}`).classList.add("active");
  });
});

/* ===========================
   MAINTENANCE MODE
=========================== */

const toggleMaintenance = document.getElementById("toggleMaintenance");

if (toggleMaintenance) {
  toggleMaintenance.addEventListener("click", () => {
    const current = localStorage.getItem("maintenance") === "true";
    localStorage.setItem("maintenance", !current);
    alert("Maintenance mode updated.");
  });
}

/* ===========================
   CHANGELOG EDITOR
=========================== */

const changelogEditor = document.getElementById("changelogEditor");
const saveChangelog = document.getElementById("saveChangelog");

if (changelogEditor) {
  changelogEditor.value = localStorage.getItem("changelog") || "";
}

if (saveChangelog) {
  saveChangelog.addEventListener("click", () => {
    localStorage.setItem("changelog", changelogEditor.value);
    alert("Changelog saved.");
  });
}

/* ===========================
   IMPORT / EXPORT JSON
=========================== */

const jsonBox = document.getElementById("jsonBox");
const importJSON = document.getElementById("importJSON");
const exportJSON = document.getElementById("exportJSON");

if (exportJSON) {
  exportJSON.addEventListener("click", () => {
    fetch("games.json")
      .then(res => res.json())
      .then(data => {
        jsonBox.value = JSON.stringify(data, null, 2);
      });
  });
}

if (importJSON) {
  importJSON.addEventListener("click", () => {
    try {
      const parsed = JSON.parse(jsonBox.value);
      localStorage.setItem("customGames", JSON.stringify(parsed));
      alert("Imported successfully.");
    } catch {
      alert("Invalid JSON.");
    }
  });
}

/* ===========================
   RESET TO DEFAULT
=========================== */

const resetDefaults = document.getElementById("resetDefaults");
const clearAll = document.getElementById("clearAll");

if (resetDefaults) {
  resetDefaults.addEventListener("click", () => {
    localStorage.removeItem("customGames");
    alert("Reset to default games.json.");
  });
}

if (clearAll) {
  clearAll.addEventListener("click", () => {
    localStorage.clear();
    alert("All data cleared.");
  });
}

/* ===========================
   PLAYER LOG VIEWER
=========================== */

const logViewer = document.getElementById("logViewer");

if (logViewer) {
  const logs = JSON.parse(localStorage.getItem("playCounts") || "{}");
  logViewer.innerHTML = Object.keys(logs)
    .map(name => `<p>${name}: ${logs[name]} plays</p>`)
    .join("");
}

/* ===========================
   FEATURED EDITOR
=========================== */

const featuredEditor = document.getElementById("featuredEditor");

if (featuredEditor) {
  fetch("games.json")
    .then(res => res.json())
    .then(data => {
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

          fetch("games.json")
            .then(res => res.json())
            .then(list => {
              const updated = list.map(g =>
                g.name === name ? { ...g, featured } : g
              );
              localStorage.setItem("customGames", JSON.stringify(updated));
            });
        });
      });
    });
}

/* ===========================
   GAME EDITOR
=========================== */

const gameEditor = document.getElementById("gameEditor");

if (gameEditor) {
  fetch("games.json")
    .then(res => res.json())
    .then(data => {
      gameEditor.innerHTML = data
        .map(g => `
          <div style="padding:10px;border:1px solid #1a1f27;margin:8px 0;border-radius:8px;">
            <strong>${g.name}</strong><br>
            <small>${g.category}</small><br>
            <button data-edit="${g.name}">Edit</button>
            <button data-delete="${g.name}" style="color:#ff3b3b;">Delete</button>
          </div>
        `)
        .join("");

      gameEditor.querySelectorAll("[data-delete]").forEach(btn => {
        btn.addEventListener("click", () => {
          const name = btn.getAttribute("data-delete");
          fetch("games.json")
            .then(res => res.json())
            .then(list => {
              const updated = list.filter(g => g.name !== name);
              localStorage.setItem("customGames", JSON.stringify(updated));
              alert("Game deleted.");
            });
        });
      });
    });
}
