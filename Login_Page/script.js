document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
  
    // ✅ LOGIN
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value;
  
      try {
        const response = await fetch("/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: email, password }),
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
  
    // ✅ REGISTER
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const username = document.getElementById("registerName").value.trim();
      const email = document.getElementById("registerEmail").value.trim();
      const password = document.getElementById("registerPassword").value;
      const confirm = document.getElementById("confirmPassword").value;
  
      if (password !== confirm) {
        alert("⚠️ Passwords do not match");
        return;
      }
  
      try {
        const response = await fetch("http://localhost:3000/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          alert(data.message || "✅ Account created!");
          document.getElementById("registerForm").reset();
          document.getElementById("showLogin").click();
        } else {
          alert(data.message || "❌ Registration failed");
        }
      } catch (error) {
        console.error("❌ Registration Error:", error);
        alert("❌ Server error");
      }
    });
  });