document.getElementById("startLock").onclick = () => {
  const msg = document.getElementById("lockMsg").value;
  const mins = parseInt(document.getElementById("lockMinutes").value) || 30;

  const data = {
    message: msg,
    endTime: Date.now() + mins * 60000
  };

  localStorage.setItem("lockdownData", JSON.stringify(data));
  alert("Lockdown activated.");
};

document.getElementById("clearLock").onclick = () => {
  localStorage.removeItem("lockdownData");
  alert("Lockdown cleared.");
};

document.getElementById("importBtn").onclick = () => {
  const url = importURL.value;
  const name = importName.value;
  const img = importImg.value;

  const custom = JSON.parse(localStorage.getItem("customGames") || "[]");

  custom.push({
    name,
    url,
    logo: img,
    category: "Custom",
    featured: false
  });

  localStorage.setItem("customGames", JSON.stringify(custom));
  alert("Game imported.");
};
