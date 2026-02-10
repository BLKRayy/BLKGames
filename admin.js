// LOGIN
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
  } else {
    alert("Incorrect username or password.");
  }
});

adminLogout.addEventListener("click", () => {
  window.location.href = "index.html";
});

// PAGE SWITCHING
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

// MAINTENANCE
const toggleMaintenance = document.getElementById("toggleMaintenance");

toggleMaintenance.addEventListener("click", () => {
  const current = localStorage.getItem("maintenance") === "true";
  localStorage.setItem("maintenance", (!current).toString());
  alert("Maintenance mode updated.");
});

// LOCKDOWN
const lockdownMessageInput = document.getElementById("lockdownMessageInput");
const lockdownMinutes = document.getElementById("lockdownMinutes");
const startLockdown = document.getElementById("startLockdown");
const clearLockdown = document.getElementById("clearLockdown");

startLockdown.addEventListener("click", () => {
  const msg = lockdownMessageInput.value.trim() || "Server is locked.";
  const mins = parseInt(lockdownMinutes.value) || 30;

  const data = {
    message: msg,
    endTime: Date.now() + mins * 60000
  };

  localStorage.setItem("lockdownData", JSON.stringify(data));
  alert("Lockdown started.");
});

clearLockdown.addEventListener("click", () => {
  localStorage.removeItem("lockdownData");
  alert("Lockdown cleared.");
});

// IMPORT GAME
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

  let custom = JSON.parse(localStorage.getItem("customGames") || "[]");

  custom.push({
    name,
    url,
    logo: img,
    category: "Custom",
    featured: false
  });

  localStorage.setItem("customGames", JSON.stringify(custom));
  alert("Game imported.");
});
