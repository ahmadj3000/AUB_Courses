let selectedCourse = ""; // Declare a global variable

// Function to fetch and display documents for a course
async function fetchDocuments(courseName) {
    try {
        console.log(`📡 Fetching documents for: ${courseName}`);
        const response = await fetch(`http://localhost:3000/documents/${encodeURIComponent(courseName)}`);
        
        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }
        
        const documents = await response.json();
        console.log("📄 Server Response:", documents);

        const grid = document.querySelector('.doc-grid');
        grid.innerHTML = ''; // Clear previous results

        if (!documents || documents.length === 0) {
            grid.innerHTML = `
                <div class="doc-card placeholder">
                    <div class="doc-image-placeholder"></div>
                    <p>No Documents Yet</p>
                </div>
            `;
        } else {
            documents.forEach(doc => {
                grid.innerHTML += `
                    <div class="doc-card">
                        <a href="${doc.image}" download>
                            <img src="${doc.image}" alt="${doc.title}" class="doc-image">
                            <p class="doc-title">${doc.title}</p>
                        </a>
                    </div>
                `;
            });
        }
    } catch (error) {
        console.error("❌ Error fetching documents:", error);
        alert("Failed to load documents.");
    }
}

// Search bar functionality
document.getElementById('search-form').addEventListener('submit', async function (e) {
    e.preventDefault(); // Prevent page reload

    const searchQuery = document.getElementById('course-input').value.trim();
    if (!searchQuery) {
        alert("Please enter a course name.");
        return;
    }

    try {
        console.log("🔍 Searching for:", searchQuery);
        const response = await fetch(`http://localhost:3000/courses?search=${encodeURIComponent(searchQuery)}`);
        console.log("📡 Fetch Response:", response.status);

        const courses = await response.json();
        console.log("📄 Server Response:", courses);

        if (courses.length === 0) {
            document.getElementById('course-content').innerHTML = `<p>No matching courses found</p>`;
            return;
        }

        selectedCourse = courses[0].name; // Save the selected course globally
        console.log("✅ Found Course:", selectedCourse);

        document.getElementById('course-content').innerHTML = `<h2>${selectedCourse} Materials:</h2><div class="doc-grid"></div>`;

        fetchDocuments(selectedCourse);
    } catch (error) {
        console.error("❌ Error searching for courses:", error);
        alert("Search failed.");
    }
});

// Upload button functionality
document.getElementById('upload-btn').addEventListener('click', () => {
    console.log("Upload button clicked");

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.style.display = 'none';

    fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];

        if (!file) {
            alert("No file selected.");
            return;
        }

        if (!selectedCourse) {
            alert("Please search for a course first before uploading.");
            return;
        }

        const formData = new FormData();
        formData.append("courseId", selectedCourse);
        formData.append("file", file);

        try {
            console.log("Uploading file...");

            const response = await fetch('http://localhost:3000/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            console.log(result);

            if (response.ok) {
                alert("File uploaded successfully!");
                fetchDocuments(selectedCourse); // Refresh document list
            } else {
                alert("Error: " + result.message);
            }
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Upload failed.");
        }
    });

    document.body.appendChild(fileInput);
    fileInput.click();
});
