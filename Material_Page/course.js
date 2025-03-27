document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const courseCode = params.get("course");

  const API_BASE = "https://aub-courses-qhnx.onrender.com"; // <-- Replace this with your real Render backend URL

  document.getElementById("courseTitle").textContent = `Materials for ${courseCode}`;

  try {
    const res = await fetch(`${API_BASE}/api/materials/course/${courseCode}`);
    const materials = await res.json();

    const container = document.getElementById("courseMaterials");
    if (!materials.length) {
      container.innerHTML = "<p>No materials uploaded for this course yet.</p>";
      return;
    }

    materials.forEach(mat => {
      const card = document.createElement("div");
      card.className = "material-item";

      const iconType = mat.type.toLowerCase() === "previouses" ? "previouses" : "materials";
      const iconSymbol = iconType === "previouses" ? "📄" : "📘";

      card.innerHTML = `
        <div class="material-icon ${iconType}">${iconSymbol}</div>
        <div class="material-content">
          <h3>${mat.title}</h3>
          <p class="material-meta">${mat.type} • ${new Date(mat.uploadedAt).toLocaleDateString()}</p>
          <p>${mat.description}</p>
          <a href="${API_BASE}${mat.fileUrl}" target="_blank" class="btn-download">📎 View Material</a>
          <a href="${API_BASE}${mat.fileUrl}" download="${mat.title}" class="btn-download red">⬇️ Download File</a>
        </div>
      `;

      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error fetching course materials:", error);
  }
});
