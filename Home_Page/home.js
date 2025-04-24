document.addEventListener('DOMContentLoaded', function() {
    var dropdownButton = document.querySelector('.dropdown-btn');
    var dropdownContent = document.querySelector('.dropdown-content');

    // If you're using an event listener for navigation
document.querySelector('.piazza-button').addEventListener('click', function() {
    window.location.href = 'comments.html';
  });
  

    // Toggle the dropdown content on click
    dropdownButton.addEventListener('click', function() {
        // Check if dropdown is already displayed, toggle accordingly
        if (dropdownContent.style.display === 'block') {
            dropdownContent.style.display = 'none';
        } else {
            dropdownContent.style.display = 'block';
        }
    });

    // Close the dropdown when clicking outside of it
    window.onclick = function(event) {
        if (!event.target.matches('.dropdown-btn')) {
            var dropdowns = document.getElementsByClassName('dropdown-content');
            for (var i = 0; i < dropdowns.length; i++) {
                var openDropdown = dropdowns[i];
                if (openDropdown.style.display === 'block') {
                    openDropdown.style.display = 'none';
                }
            }
        }
    };
});
