document.getElementById('comment-form').addEventListener('submit', function(event) {
    event.preventDefault();

    var commentInput = document.getElementById('comment-input');
    if (commentInput.value.trim() !== "") {
        var newComment = document.createElement('li');
        newComment.className = 'comment-item';
        newComment.innerHTML = `
            <div class="comment-avatar"><img src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png" alt="New Commenter Avatar"></div>
            <div class="comment-content">
                <div class="comment-head">Anonymus Student</div>
                ${commentInput.value}
            </div>
        `;
        document.getElementById('comments-list').appendChild(newComment);
        commentInput.value = ''; // Clear the input after adding
    } else {
        alert("Please enter a comment.");
    }
});
