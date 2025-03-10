// Menu Dropdown
document.querySelector(".dropdown-btn").addEventListener("click", function() {
    document.querySelector(".dropdown-content").classList.toggle("show");
});

// Log Out Functionality
document.querySelector("#logout").addEventListener("click", function() {
    alert("You have logged out.");
    window.location.href = "../Login_Page/index.html"; // Redirect to login page
});
