async function checkUserSession() {
  try {
    const res = await fetch(`${API_BASE}/api/user/me`, {
      credentials: "include"
    });

    if (!res.ok) throw new Error("Not logged in");

    const user = await res.json();
    const profileCircle = document.getElementById("profile-circle");
    const userPanel = document.getElementById("user-panel");

    if (profileCircle) {
      profileCircle.textContent = user.username.charAt(0).toUpperCase();
      profileCircle.classList.remove("hidden");
    }

    document.getElementById("panel-username").textContent = user.username;
    document.getElementById("panel-email").textContent = user.email;
  } catch {
    // Redirect to login if not logged in
    window.location.href = "/Login_Page/login.html";
  }
}

function toggleUserPanel() {
  const panel = document.getElementById("user-panel");
  if (panel) panel.classList.toggle("hidden");
}

async function logoutUser() {
  await fetch(`${API_BASE}/api/user/logout`, {
    method: "POST",
    credentials: "include"
  });
  window.location.href = "/Login_Page/login.html";
}

checkUserSession();
