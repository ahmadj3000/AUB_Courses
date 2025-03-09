// 1. With documents:
let allDocs = [
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
    ]; 
  
  // 2. With no documents:
   // let allDocs = [];
  
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
        const imageSrc =  'Empty_Document.png';
        grid.innerHTML += `
          <div class="doc-card">
            <img src="${imageSrc}" alt="${doc.title}" class="doc-image">
            <p class="doc-title">${doc.title}</p>
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
  });
  