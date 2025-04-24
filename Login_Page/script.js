const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');

if (container && registerBtn && loginBtn) {
    registerBtn.addEventListener('click', () => {
        container.classList.add('active');
    });

    loginBtn.addEventListener('click', () => {
        container.classList.remove('active');
    });
} else {
    console.error('❌ One or more elements not found!');
}

// ✅ Handle Signup
document.querySelector('.formbox.register form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = e.target[0].value.trim();
    const email = e.target[1].value.trim();
    const password = e.target[2].value.trim();

    if (!username || !email || !password) {
        alert("⚠️ Please fill in all fields!");
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
        });

        const data = await response.json();
        
        if (response.ok) {
            alert("✅ Registration successful! Please log in.");
        } else {
            alert(`❌ ${data.message}`);
        }
    } catch (error) {
        console.error("❌ Registration error:", error);
        alert("❌ Server error. Please try again.");
    }
});

// ✅ Handle Login (Now Redirects to Home Page)
document.querySelector('.formbox.login form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = e.target[0].value.trim();
    const password = e.target[1].value.trim();

    if (!username || !password) {
        alert("⚠️ Please fill in all fields!");
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);  // ✅ Save JWT Token
            alert("✅ Login successful! Redirecting to home page...");
            window.location.href = "../Home_Page/home.html";  // ✅ Redirect to Home Page
        } else {
            alert(`❌ ${data.message}`);
        }
    } catch (error) {
        console.error("❌ Login error:", error);
        alert("❌ Server error. Please try again.");
    }
});
