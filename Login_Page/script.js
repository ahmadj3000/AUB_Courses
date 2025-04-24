const API_BASE = window.location.hostname.includes("onrender.com")
  ? "https://aub-courses-qhnx.onrender.com"
  : "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const showRegister = document.getElementById("showRegister");
  const showLogin = document.getElementById("showLogin");

  // Show the register form when clicking "Sign Up"
  showRegister.addEventListener("click", (e) => {
    e.preventDefault();
    loginForm.classList.remove("active");
    registerForm.classList.add("active");
    history.replaceState(null, null, "#register");
  });

  // Show the login form when clicking "Login"
  showLogin.addEventListener("click", (e) => {
    e.preventDefault();
    registerForm.classList.remove("active");
    loginForm.classList.add("active");
    history.replaceState(null, null, "#login");
  });

  // PASSWORD TOGGLE FUNCTIONALITY
  document.querySelectorAll(".password-toggle").forEach(button => {
    button.addEventListener("click", () => {
      const passwordField = button.previousElementSibling; // Get the input field
      if (passwordField.type === "password") {
        passwordField.type = "text"; // Show password
        button.innerHTML = '<i class="fas fa-eye-slash"></i>'; // Change icon to eye-slash
      } else {
        passwordField.type = "password"; // Hide password
        button.innerHTML = '<i class="fas fa-eye"></i>'; // Restore eye icon
      }
    });
  });

  // ✅ LOGIN FUNCTIONALITY
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
        credentials: "include"
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message || "✅ Login successful!");
        window.location.href = "/Home_Page/home.html";
      } else {
        alert(data.message || "❌ Login failed");
      }
    } catch (error) {
      console.error("❌ Login Error:", error);
      alert("❌ Server error");
    }
  });

  // ✅ REGISTER FUNCTIONALITY
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;
    const confirm = document.getElementById("confirmPassword").value;
    const major = document.getElementById("registerMajor").value; // ✅ ADDED

    if (password !== confirm) {
      alert("⚠️ Passwords do not match");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, major }),// included major
        credentials: "include"
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message || "✅ Account created!");
        document.getElementById("registerForm").reset();
        showLogin.click();
      } else {
        alert(data.message || "❌ Registration failed");
      }
    } catch (error) {
      console.error("❌ Registration Error:", error);
      alert("❌ Server error");
    }
  });
  // 🔁 Auto-switch based on URL hash
  if (window.location.hash === "#register") {
    showRegister.click();
    history.replaceState(null, null, "#register"); // optional: keep #register in URL
  }

  if (window.location.hash === "#login") {
    showLogin.click();
    history.replaceState(null, null, "#login"); // optional: keep #login in URL
  }  
});
