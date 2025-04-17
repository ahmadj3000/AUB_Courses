const API_BASE = window.location.hostname.includes("localhost")
  ? "http://localhost:3000"
  : "https://aub-courses-qhnx.onrender.com";

async function checkUserSession() {
  try {
    const res = await fetch(`${API_BASE}/api/user/me`, {
      credentials: "include", // ✅ This sends the cookie
    });

    if (!res.ok) throw new Error("Not logged in");
    const user = await res.json();

    document.querySelector(".auth-buttons")?.classList.add("hidden");
    const profileCircle = document.getElementById("profile-circle");
    if (profileCircle) {
      profileCircle.textContent = user.username.charAt(0).toUpperCase();
      profileCircle.classList.remove("hidden");
    }

    document.getElementById("panel-username").textContent = user.username;
    document.getElementById("panel-email").textContent = user.email;
  } catch {
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
  await fetch(`${API_BASE}/api/user/logout`, {
    method: "POST",
    credentials: "include",
  });
  window.location.href = "/Login_Page/login.html";
}

checkUserSession();
