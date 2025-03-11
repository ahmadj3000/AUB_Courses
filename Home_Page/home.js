document.getElementById('comment-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting to a server

    var commentInput = document.getElementById('comment-input');
    if (commentInput.value.trim() !== "") {
        var newComment = document.createElement('li');
        newComment.className = 'comment-main-level';
        newComment.innerHTML = `
            <div class="comment-avatar"><img src="http://i9.photobucket.com/albums/a88/creaticode/avatar_4_zps6f333073.jpg" alt=""></div>
            <div class="comment-box">
                <div class="comment-head">
                    <h6 class="comment-name"><a href="#">New Commenter</a></h6>
                    <span>just now</span>
                    <i class="fa fa-reply"></i>
                    <i class="fa fa-heart"></i>
                </div>
                <div class="comment-content">
                    ${commentInput.value}
                </div>
            </div>
        `;
        document.getElementById('comments-list').appendChild(newComment);
        commentInput.value = ''; // Clear the input after adding
    } else {
        alert("Please enter a comment.");
    }
});
