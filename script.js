let games = [];
let profile = null;
let heroGame = null;

/* PROFILE + THEME */
function loadProfile() {
  const saved = localStorage.getItem("blkProfile");
  if (saved) {
    profile = JSON.parse(saved);
  } else {
    profile = { username: "Guest", favorites: [], recent: [], theme: "dark" };
    saveProfile();
  }
  applyTheme(profile.theme);
}

function saveProfile() {
  localStorage.setItem("blkProfile", JSON.stringify(profile));
}

function applyTheme(t) {
  document.body.classList.remove("theme-dark", "theme-light");
  document.body.classList.add(t === "light" ? "theme-light" : "theme-dark");
}

function toggleTheme() {
  profile.theme = profile.theme === "light" ? "dark" : "light";
  saveProfile();
  applyTheme(profile.theme);
}

/* GAMES */
function loadGames() {
  return fetch("games.json")
    .then(r => r.json())
    .then(data => {
      const custom = localStorage.getItem("customGames");
      games = custom ? JSON.parse(custom) : data;
    });
}

function populateCategories() {
  const select = document.getElementById("categoryFilter");
  const chips = document.getElementById("categoryChips");
  const cats = new Set(["All"]);
  games.forEach(g => cats.add(g.category));

  select.innerHTML = "";
  cats.forEach(c => {
    const o = document.createElement("option");
    o.value = c;
    o.textContent = c;
    select.appendChild(o);
  });

  chips.innerHTML = "";
  cats.forEach(c => {
    const b = document.createElement("button");
    b.className = "chip";
    b.textContent = c;
    b.onclick = () => {
      select.value = c;
      renderAll();
    };
    chips.appendChild(b);
  });
}

function filteredGames() {
  const q = document.getElementById("searchInput").value.toLowerCase();
  const cat = document.getElementById("categoryFilter").value;
  return games.filter(g =>
    (cat === "All" || g.category === cat) &&
    g.name.toLowerCase().includes(q)
  );
}

function renderAll() {
  const fav = document.getElementById("favoriteGames");
  const feat = document.getElementById("featuredGames");
  const all = document.getElementById("allGames");

  const f = filteredGames();

  feat.innerHTML = f.filter(g => g.featured).map(card).join("");
  all.innerHTML = f.map(row).join("");

  fav.innerHTML = games
    .filter(g => profile.favorites.includes(g.url))
    .map(card)
    .join("");

  updateHero();
}

function card(g) {
  return `
    <div class="card">
      <div class="thumb" onclick="openGame('${g.url}')">
        <img src="${g.logo || 'default-icon.png'}">
      </div>
      <button class="fav" onclick="toggleFav(event,'${g.url}')">★</button>
      <div style="margin-top:6px;font-size:14px;">${g.name}</div>
      <div style="font-size:11px;color:#9ca3af">${g.category}</div>
    </div>
  `;
}

function row(g) {
  return `
    <div class="row" onclick="openGame('${g.url}')">
      <span>${g.name}</span>
      <span>${g.category}</span>
    </div>
  `;
}

function toggleFav(e, url) {
  e.stopPropagation();
  const i = profile.favorites.indexOf(url);
  if (i === -1) profile.favorites.push(url);
  else profile.favorites.splice(i, 1);
  saveProfile();
  renderAll();
}

function openGame(url) {
  window.open(url, "_blank");
  const i = profile.recent.indexOf(url);
  if (i !== -1) profile.recent.splice(i, 1);
  profile.recent.unshift(url);
  if (profile.recent.length > 10) profile.recent.pop();
  saveProfile();
}

/* HERO FEATURED */
function updateHero() {
  const featured = games.filter(g => g.featured);
  heroGame = featured[0] || games[0];
  if (!heroGame) return;

  document.getElementById("heroTitle").textContent = heroGame.name;
  document.getElementById("heroGameName").textContent = heroGame.name;
  document.getElementById("heroDesc").textContent =
    heroGame.description ||
    "Jump in and play instantly in your browser.";
}

/* MAINTENANCE */
function applyMaintenance() {
  const pill = document.getElementById("maintStatus");
  const m = localStorage.getItem("maintenance") === "true";
  pill.textContent = m ? "Maintenance" : "Online";
  pill.style.background = m ? "#451a03" : "#022c22";
}

/* LOCKDOWN (HARD BLOCK) */
function applyLockdown() {
  const box = document.getElementById("lockdownScreen");
  const dataRaw = localStorage.getItem("globalLockdown");
  if (!dataRaw) return false;

  const data = JSON.parse(dataRaw);
  const now = Date.now();
  if (now >= data.end) {
    localStorage.removeItem("globalLockdown");
    return false;
  }

  box.classList.remove("hidden");

  const currentEl = document.getElementById("lockCurrentTime");
  const nextEl = document.getElementById("lockNextUnlock");

  function formatTime(d) {
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: "America/New_York"
    }) + " EST";
  }

  function formatNextUnlock(endMs) {
    const d = new Date(endMs);
    return d.toLocaleString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "America/New_York"
    });
  }

  function tick() {
    const now = Date.now();
    if (now >= data.end) {
      localStorage.removeItem("globalLockdown");
      location.reload();
      return;
    }
    currentEl.textContent = formatTime(new Date());
    nextEl.textContent = formatNextUnlock(data.end);
  }

  tick();
  setInterval(tick, 1000);

  // Admin override button -> go to admin panel
  document.getElementById("lockAdminOverride").onclick = () => {
    window.location.href = "admin.html";
  };

  return true;
}

/* AI (same as before, shortened) */
function initAI() {
  const modal = document.getElementById("aiModal");
  const btn = document.getElementById("aiButton");
  const close = document.getElementById("aiClose");
  const send = document.getElementById("aiSend");
  const input = document.getElementById("aiInput");
  const msgs = document.getElementById("aiMessages");

  function add(text, who) {
    const d = document.createElement("div");
    d.className = "ai-msg " + (who === "user" ? "ai-user" : "ai-bot");
    d.textContent = text;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function reply(q) {
    const t = q.toLowerCase();
    if (/^[0-9+\-*/().\s^]+$/.test(q)) {
      try {
        return "Answer: " + Function(`return (${q})`)();
      } catch {
        return "Invalid math expression.";
      }
    }
    if (t.includes("favorite")) {
      if (!profile.favorites.length) return "You have no favorites yet.";
      return "Favorites: " + profile.favorites.length;
    }
    if (t.includes("games")) {
      return "Total games: " + games.length;
    }
    return "I can solve math, recommend games, and show your favorites.";
  }

  btn.onclick = () => {
    modal.classList.remove("hidden");
    if (!msgs.children.length) add("Hey, I'm BLK Copilot!", "bot");
  };

  close.onclick = () => modal.classList.add("hidden");

  send.onclick = () => {
    const q = input.value.trim();
    if (!q) return;
    add(q, "user");
    input.value = "";
    setTimeout(() => add(reply(q), "bot"), 300);
  };

  input.onkeydown = e => {
    if (e.key === "Enter") send.onclick();
  };
}

/* INIT */
document.addEventListener("DOMContentLoaded", async () => {
  // 1) Check lockdown FIRST. If active, stop everything else.
  const locked = applyLockdown();
  if (locked) return;

  // 2) Normal flow
  loadProfile();
  await loadGames();
  populateCategories();
  renderAll();
  applyMaintenance();

  document.getElementById("themeToggle").onclick = toggleTheme;
  document.getElementById("profileBtn").onclick = () => {
    const n = prompt("Username:", profile.username);
    if (n) {
      profile.username = n;
      saveProfile();
    }
  };

  document.getElementById("searchInput").oninput = renderAll;
  document.getElementById("categoryFilter").onchange = renderAll;

  document.getElementById("heroPlay").onclick = () => {
    if (heroGame) openGame(heroGame.url);
  };

  initAI();
});
