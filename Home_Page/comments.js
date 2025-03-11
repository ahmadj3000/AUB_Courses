document.addEventListener('DOMContentLoaded', function() {
    const commentForm = document.getElementById('comment-form');
    commentForm.addEventListener('submit', function(event) {
        event.preventDefault();

        var commentInput = document.getElementById('comment-input');
        if (commentInput.value.trim() !== "") {
            var newComment = document.createElement('li');
            newComment.className = 'comment-item';
            newComment.innerHTML = `
                <div class="comment-avatar"><img src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png" alt="New Commenter Avatar"></div>
                <div class="comment-content">
                    <div class="comment-head">
                        <span class="comment-author">Anonymous</span>
                        <button class="reply-btn">Reply</button>
                        <button class="thumb-up-btn">👍 <span class="thumbs-up-count">0</span></button>
                        <button class="thumb-down-btn">👎 <span class="thumbs-down-count">0</span></button>
                    </div>
                    ${commentInput.value}
                    <div class="reply-form-container" style="display:none;">
                        <textarea class="reply-input"></textarea>
                        <button class="send-reply-btn">Send</button>
                    </div>
                    <ul class="replies-list"></ul>
                </div>
            `;
            document.getElementById('comments-list').appendChild(newComment);
            attachReplyButtonEvent(newComment.querySelector('.reply-btn'));
            attachSendButtonEvent(newComment.querySelector('.send-reply-btn'));
            commentInput.value = '';
        } else {
            alert("Please enter a comment.");
        }
    });

    // Attach events to existing buttons
    document.querySelectorAll('.reply-btn').forEach(button => {
        attachReplyButtonEvent(button);
    });

    document.querySelectorAll('.send-reply-btn').forEach(button => {
        attachSendButtonEvent(button);
    });

    function attachReplyButtonEvent(button) {
        button.addEventListener('click', function() {
            const replyForm = this.parentNode.nextElementSibling; // Locate the reply form related to this reply button
            replyForm.style.display = replyForm.style.display === 'block' ? 'none' : 'block';
        });
    }

    function attachSendButtonEvent(button) {
        button.addEventListener('click', function() {
            const replyInput = this.previousElementSibling;
            const replyText = replyInput.value.trim();
            if (replyText !== "") {
                var newReply = document.createElement('li');
                newReply.textContent = replyText; // Additional styling or elements can be added here
                this.closest('.comment-content').querySelector('.replies-list').appendChild(newReply);
                replyInput.value = '';
                this.parentNode.style.display = 'none'; // Optionally hide the reply form after sending
            } else {
                alert('Please enter a reply.');
            }
        });
    }
});
