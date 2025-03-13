document.addEventListener("DOMContentLoaded", () => {
    loadAnswers(); // Load saved answers on page load
});

// ✅ Load answers from backend
async function loadAnswers() {
    try {
        const response = await fetch("http://localhost:3000/answers");

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const answers = await response.json();
        console.log("Loaded Answers from Backend:", answers); // Debugging

        const questionContainer = document.getElementById("questions-container");
        questionContainer.innerHTML = ""; // Clear UI before rendering

        answers.forEach(addAnswerToUI);
    } catch (error) {
        console.error("Failed to load answers:", error);
    }
}

// ✅ Post a new question with category
document.getElementById("question-form").addEventListener("submit", async function(event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const category = document.getElementById("category").value.trim(); // ✅ Get category
    const questionText = document.getElementById("question").value.trim();

    if (!username || !category || !questionText) {
        alert("Please enter your name, category, and question.");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/answers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, category, answerText: questionText }) // ✅ Send category
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const newAnswer = await response.json();
        addAnswerToUI(newAnswer);

        // Clear input fields
        document.getElementById("username").value = "";
        document.getElementById("category").value = "";
        document.getElementById("question").value = "";
    } catch (error) {
        console.error("Error posting answer:", error);
    }
});

// ✅ Function to add an answer to the UI
function addAnswerToUI(answer) {
    const questionContainer = document.getElementById("questions-container");

    const answerCard = document.createElement("div");
    answerCard.classList.add("answer-box");
    answerCard.setAttribute("id", `answer-${answer.id}`);

    // ✅ Ensure `replies` exists and is an array
    const replyCount = (Array.isArray(answer.replies)) ? answer.replies.length : 0;

    answerCard.innerHTML = `
        <div class="answer-header">
            <strong>${answer.username} <span class="category-tag">(${answer.category})</span>:</strong> 
        </div>
        <p>${answer.answerText}</p>

        <div class="answer-actions">
            <button class="like-btn" onclick="increaseLike(${answer.id}, this)">
                👍 <span class="like-counter">${answer.likes}</span>
            </button>
            <span class="reply-count" id="reply-count-${answer.id}">${replyCount} Replies</span>
        </div>

        <!-- Replies Container -->
        <div class="replies-container" id="replies-${answer.id}"></div>

        <!-- Reply Form -->
        <div class="reply-form">
            <input type="text" id="reply-username-${answer.id}" placeholder="Your Name">
            <textarea id="reply-text-${answer.id}" placeholder="Write a reply..."></textarea>
            <button onclick="postReply(${answer.id})">Post Reply</button>
        </div>
    `;

    questionContainer.prepend(answerCard);

    // ✅ Load existing replies
    if (Array.isArray(answer.replies) && answer.replies.length > 0) {
        answer.replies.forEach(reply => addReplyToUI(answer.id, reply));
    }
}

// ✅ Function to increase like count
async function increaseLike(answerId, button) {
    try {
        const response = await fetch(`http://localhost:3000/answers/${answerId}/like`, {
            method: "POST"
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const updatedAnswer = await response.json();
        button.querySelector(".like-counter").textContent = updatedAnswer.likes;
    } catch (error) {
        console.error("Error updating likes:", error);
    }
}

// ✅ Function to post a reply
async function postReply(answerId) {
    const replyInput = document.getElementById(`reply-text-${answerId}`);
    const nameInput = document.getElementById(`reply-username-${answerId}`);

    const replyText = replyInput.value.trim();
    const username = nameInput.value.trim();

    if (!replyText || !username) {
        alert("Please enter your name and reply.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/answers/${answerId}/reply`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, replyText })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const newReply = await response.json();
        addReplyToUI(answerId, newReply);

        // Clear input fields
        replyInput.value = "";
        nameInput.value = "";

        // ✅ Update reply count
        const replyCounter = document.getElementById(`reply-count-${answerId}`);
        replyCounter.textContent = `${parseInt(replyCounter.textContent) + 1} Replies`;
    } catch (error) {
        console.error("Error posting reply:", error);
    }
}

// ✅ Function to add reply to UI
function addReplyToUI(answerId, reply) {
    const replyContainer = document.getElementById(`replies-${answerId}`);

    if (!replyContainer) {
        console.error(`Replies container not found for answer ${answerId}`);
        return;
    }

    const replyElement = document.createElement("div");
    replyElement.classList.add("reply-box");
    replyElement.innerHTML = `<strong>${reply.username}:</strong> ${reply.replyText}`;
    replyContainer.appendChild(replyElement);
}
