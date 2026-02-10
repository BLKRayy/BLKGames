// ===== LOCKDOWN =====
const lockdownMessageInput = document.getElementById("lockdownMessageInput");
const lockdownMinutes = document.getElementById("lockdownMinutes");
const startLockdown = document.getElementById("startLockdown");
const clearLockdown = document.getElementById("clearLockdown");

// GLOBAL URL-BASED LOCKDOWN (NEW)
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
