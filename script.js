let games = [];
let profile = null;

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

function loadGames() {
  fetch("games.json")
    .then(r => r.json())
    .then(data => {
      const custom = localStorage.getItem("customGames");
      games = custom ? JSON.parse(custom) : data;
      populateCategories();
      renderAll();
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
  const rec = document.getElementById("recentGames");
  const feat = document.getElementById("featuredGames");
  const all = document.getElementById("allGames");

  const f = filteredGames();

  feat.innerHTML = f.filter(g => g.featured).map(card).join("");
  all.innerHTML = f.map(row).join("");

  fav.innerHTML = games
    .filter(g => profile.favorites.includes(g.url))
    .map(card)
    .join("");

  rec.innerHTML = profile.recent
    .map(u => games.find(g => g.url === u))
    .filter(Boolean)
    .map(card)
    .join("");
}

function card(g) {
  return `
    <div class="card">
      <div class="thumb" onclick="openGame('${g.url}')">
        <img src="${g.logo || 'default-icon.png'}">
      </div>
      <button class="fav" onclick="toggleFav(event,'${g.url}')">★</button>
      <div>${g.name}</div>
      <div style="font-size:12px;color:#9ca3af">${g.category}</div>
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
  renderAll();
}

function applyMaintenance() {
  const pill = document.getElementById("maintStatus");
  const m = localStorage.getItem("maintenance") === "true";
  pill.textContent = m ? "Maintenance" : "Online";
  pill.style.background = m ? "#451a03" : "#022c22";
}

function applyLockdown() {
  const box = document.getElementById("lockdownScreen");
  const data = JSON.parse(localStorage.getItem("globalLockdown") || "null");
  if (!data) return;

  box.classList.remove("hidden");

  function tick() {
    const now = Date.now();
    if (now >= data.end) {
      localStorage.removeItem("globalLockdown");
      box.classList.add("hidden");
      return;
    }
    const diff = data.end - now;
    const m = Math.floor(diff / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    document.getElementById("lockMsg").textContent = data.msg;
    document.getElementById("lockCountdown").textContent = `${m}m ${s}s`;
  }

  tick();
  setInterval(tick, 1000);
}

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

document.addEventListener("DOMContentLoaded", () => {
  loadProfile();
  loadGames();
  applyMaintenance();
  applyLockdown();

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

  initAI();
});
