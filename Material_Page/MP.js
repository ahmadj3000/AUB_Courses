// 1. With documents:
/*let allDocs = [
  { title: "Document 1", image: 'Empty_Document.png' },
  { title: "Document 2", image: 'Empty_Document.png' },
  { title: "Document 3", image: 'Empty_Document.png' },
  { title: "Document 4", image: 'Empty_Document.png' },
  { title: "Document 5", image: 'Empty_Document.png' },
  { title: "Document 6", image: 'Empty_Document.png' },
  { title: "Document 7", image: 'Empty_Document.png' },
  { title: "Document 8", image: 'Empty_Document.png' },
  { title: "Document 9", image: 'Empty_Document.png' },
  { title: "Document 10", image: 'Empty_Document.png' },
  { title: "Document 11", image: 'Empty_Document.png' },
  { title: "Document 12", image: 'Empty_Document.png' },
];*/
let allDocs = [];

// Render function
function renderDocs() {
  const grid = document.querySelector('.doc-grid');
  grid.innerHTML = '';

  if (allDocs.length === 0) {
    grid.innerHTML = `
      <div class="doc-card placeholder">
        <div class="doc-image-placeholder"></div>
        <p>No Documents Yet</p>
      </div>
    `;
  } else {
    allDocs.forEach(doc => {
      // Use the document's image property; if you want to show the uploaded file, this should be the file's URL.
      grid.innerHTML += `
        <div class="doc-card">
          <a href="${doc.image}" download="${doc.title}">
            <img src="${doc.image}" alt="${doc.title}" class="doc-image">
            <p class="doc-title">${doc.title}</p>
          </a>
        </div>
      `;
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Ensure a grid container exists in the course content area
  const courseContent = document.getElementById('course-content');
  let grid = document.querySelector('.doc-grid');
  if (!grid) {
    grid = document.createElement('div');
    grid.className = 'doc-grid';
    courseContent.appendChild(grid);
  }
  renderDocs();

  // Attach the upload button functionality
  const uploadBtn = document.getElementById('upload-btn');
  uploadBtn.addEventListener('click', () => {
    console.log("Upload button clicked");
    // Create a hidden file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.style.display = 'none';

    // When a file is selected, add it to the list
    fileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      console.log("File selected:", file);
      if (file) {
        // Create a temporary URL for the file so it can be displayed
        const fileURL = URL.createObjectURL(file);
        console.log("File URL:", fileURL);
        // Add the new document to the allDocs array
        allDocs.push({
          title: file.name,
          image: fileURL
        });
        // Re-render the document grid to include the new file
        renderDocs();
      }
    });

    // Append the file input to the body and open the file dialog
    document.body.appendChild(fileInput);
    fileInput.click();
    // Optionally remove the file input after triggering the click
    // fileInput.remove();
  });
});
