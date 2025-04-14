const API_BASE = window.location.hostname.includes("localhost")
  ? "http://localhost:3000"
  : "https://aub-courses-qhnx.onrender.com";

async function checkUserSession() {
  try {
    const res = await fetch(`${API_BASE}/api/user/me`);
    if (!res.ok) throw new Error("Not logged in");
    const user = await res.json();

    const authButtons = document.querySelector(".auth-buttons");
    const profileCircle = document.getElementById("profile-circle");
    const userPanel = document.getElementById("user-panel");

    if (authButtons) authButtons.style.display = "none";
    if (profileCircle) {
      profileCircle.textContent = user.username.charAt(0).toUpperCase();
      profileCircle.classList.remove("hidden");
    }

    // Inject user info in panel
    document.getElementById("panel-username").textContent = user.username;
    document.getElementById("panel-email").textContent = user.email;
  } catch {
    // Show login/signup if not logged in
    document.querySelector(".auth-buttons")?.classList.remove("hidden");
    document.getElementById("profile-circle")?.classList.add("hidden");
    document.getElementById("user-panel")?.classList.add("hidden");
  }
}

function toggleUserPanel() {
  const panel = document.getElementById("user-panel");
  if (panel) panel.classList.toggle("hidden");
}

async function logoutUser() {
  await fetch(`${API_BASE}/api/user/logout`, { method: "POST" });
  window.location.href = "/Login_Page/login.html";
}

checkUserSession();
