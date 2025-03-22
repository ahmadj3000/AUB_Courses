document.addEventListener("DOMContentLoaded", () => {
  loadCourses();

  // ✅ Update custom file label text
  const fileInput = document.getElementById("fileInput");
  const fileNameLabel = document.querySelector(".file-name");

  fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
      fileNameLabel.textContent = fileInput.files[0].name;
    } else {
      fileNameLabel.textContent = "No file chosen";
    }
  });

  // ✅ Handle upload form
  document.getElementById("materialForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    await uploadMaterial();
  });

  // ✅ Search filter input
  document.getElementById("searchInput")?.addEventListener("input", filterMaterials);
});

let allCourses = [];

// ✅ Upload Material
async function uploadMaterial() {
  const title = document.getElementById("title").value.trim();
  const courseCode = document.getElementById("course").value.trim().toUpperCase();
  const type = document.getElementById("type").value.trim();
  const description = document.getElementById("description").value.trim();
  const fileInput = document.getElementById("fileInput");

  if (!title || !courseCode || !type || !description || !fileInput.files.length) {
    alert("⚠️ All fields are required including file, course code, and type.");
    return;
  }

  const formData = new FormData();
  formData.append("title", title);
  formData.append("courseCode", courseCode);
  formData.append("type", type);
  formData.append("description", description);
  formData.append("file", fileInput.files[0]);

  try {
    const response = await fetch("http://localhost:3000/api/materials/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Upload failed");

    alert("✅ Material uploaded!");
    document.getElementById("materialForm").reset();
    document.querySelector(".file-name").textContent = "No file chosen";
  } catch (err) {
    console.error("❌ Upload failed:", err);
    alert("❌ Upload failed. Check console for details.");
  }
}

// ✅ Hardcoded Course List
function loadCourses() {
  allCourses = [
    { code: "CMPS 201", title: "Introduction to Programming" },
    { code: "PHYS 200", title: "General Physics" },
    { code: "CHEM 201", title: "Basic Chemistry" },
    { code: "ENGL 203", title: "Academic English" },
    { code: "MATH 201", title: "Calculus I" }
  ];

  renderCourses(allCourses);
}

// ✅ Render courses to the DOM
function renderCourses(courseList) {
  const container = document.getElementById("courseList");
  container.innerHTML = "";

  courseList.forEach(course => {
    const courseCard = document.createElement("div");
    courseCard.className = "material-item"; // use Lovable style
    courseCard.innerHTML = `
      <div class="material-icon materials">📘</div>
      <div class="material-content">
        <h3>${course.code}</h3>
        <p class="material-meta">${course.title}</p>
        <button class="btn-download red" onclick="openCourse('${course.code}')">View</button>
      </div>
    `;
    container.appendChild(courseCard);
  });
}

// ✅ Filter courses based on search input
function filterMaterials() {
  const query = document.getElementById("searchInput").value.trim().toUpperCase();

  const filteredCourses = allCourses.filter(course =>
    course.code.includes(query) || course.title.toUpperCase().includes(query)
  );

  renderCourses(filteredCourses);
}

// ✅ Navigate to course view
function openCourse(courseCode) {
  window.location.href = `course.html?course=${encodeURIComponent(courseCode)}`;
}
