// Mock course data - replace this with actual course data if needed
const courses = [
    { id: 1, name: 'Computer Science 101', homePage: '/course/1.html' },
    { id: 2, name: 'Mathematics 201', homePage: '/course/2.html' },
    { id: 3, name: 'Physics 101', homePage: '/course/3.html' },
    // Add more courses as needed
];

// Function to handle search and display courses
document.getElementById('searchButton').addEventListener('click', function () {
    const query = document.getElementById('courseSearchInput').value.toLowerCase();
    const filteredCourses = courses.filter(course => course.name.toLowerCase().includes(query));
    
    // Get the div to display course results
    const courseListDiv = document.getElementById('courseList');
    courseListDiv.innerHTML = ''; // Clear previous results
    
    // Add the filtered courses to the page
    filteredCourses.forEach(course => {
        const courseItem = document.createElement('div');
        courseItem.innerHTML = `<a href="${course.homePage}">${course.name}</a>`;
        courseListDiv.appendChild(courseItem);
    });
});
