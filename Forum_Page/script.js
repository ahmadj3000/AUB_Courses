document.addEventListener("DOMContentLoaded", () => {
    console.log("📌 Page loaded, calling loadQuestions()...");
    loadQuestions();
});

// ✅ Fetch and Display Questions from MongoDB
async function loadQuestions() {
    try {
        console.log("📌 Fetching questions from MongoDB...");
        const response = await fetch("http://localhost:3000/questions");

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const questions = await response.json();
        console.log("🔍 Questions from MongoDB:", questions);  // ✅ Debugging Log

        if (questions.length === 0) {
            console.warn("⚠️ No questions found in database.");
        }

        const questionContainer = document.getElementById("questions-container");
        questionContainer.innerHTML = ""; // Clear before reloading

        questions.forEach(question => {
            console.log("📌 Adding question to UI:", question);
            addQuestionToUI(question);
        });
    } catch (error) {
        console.error("❌ Failed to load questions:", error);
    }
}


// ✅ Post a New Question to MongoDB
async function postQuestion() {
    const username = document.getElementById("username").value.trim();
    const category = document.getElementById("category").value.trim();
    const questionText = document.getElementById("question").value.trim();

    if (!username || !category || !questionText) {
        alert("⚠️ Please fill in all fields.");
        return;
    }

    const postData = { username, category, questionText };
    console.log("📤 Sending Question Data:", postData);  // ✅ Debugging Log

    try {
        const response = await fetch("http://localhost:3000/questions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(postData)
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        console.log("✅ Question Posted Successfully");
        document.getElementById("username").value = "";
        document.getElementById("category").value = "";
        document.getElementById("question").value = "";

        loadQuestions(); // ✅ Refresh UI with new data
    } catch (error) {
        console.error("❌ Error posting question:", error);
    }
}


function addQuestionToUI(question) {
    console.log("📌 Adding question to UI:", question);

    const questionContainer = document.getElementById("questions-container");

    if (!questionContainer) {
        console.error("❌ ERROR: 'questions-container' not found in DOM.");
        return;
    }

    const questionCard = document.createElement("div");
    questionCard.classList.add("answer-box"); // ✅ Uses `.answer-box`

    questionCard.innerHTML = `
        <div class="answer-header">
            <strong class="question-user">${question.username} (${question.category}):</strong>
        </div>
        <p class="question-text">${question.questionText}</p>

        <div class="answer-actions">
            <button class="like-btn" onclick="likeQuestion('${question._id}', this)">
                👍 <span class="like-counter">${question.likes}</span>
            </button>
            <span class="reply-count" id="reply-count-${question._id}">${question.replies.length} Replies</span>
            <button class="reply-btn" onclick="toggleReplyForm('${question._id}')">💬 Reply</button>
        </div>

        <!-- Replies Container -->
        <div class="replies-container" id="replies-${question._id}">
            ${question.replies.map(reply => `
                <div class="reply-box"><strong>${reply.username}:</strong> ${reply.replyText}</div>
            `).join('')}
        </div>

        <!-- Reply Form (Initially Hidden) -->
        <div class="reply-form" id="reply-form-${question._id}" style="display: none;">
            <input type="text" id="reply-username-${question._id}" placeholder="Your Name">
            <textarea id="reply-text-${question._id}" placeholder="Write a reply..."></textarea>
            <button onclick="postReply('${question._id}')">Post Reply</button>
        </div>
    `;

    questionContainer.prepend(questionCard);
}


function toggleReplyForm(questionId) {
    console.log(`📌 Toggling reply form for question ID: ${questionId}`);

    const replyForm = document.getElementById(`reply-form-${questionId}`);
    if (!replyForm) {
        console.error("❌ Reply form not found!");
        return;
    }

    // Toggle visibility
    if (replyForm.style.display === "none" || !replyForm.style.display) {
        replyForm.style.display = "flex";
    } else {
        replyForm.style.display = "none";
    }
}

// ✅ Function to Post a Reply to MongoDB
async function postReply(questionId) {
    const replyText = document.getElementById(`reply-text-${questionId}`).value.trim();
    const username = document.getElementById(`reply-username-${questionId}`).value.trim();

    if (!replyText || !username) {
        alert("⚠️ Please enter your name and reply.");
        return;
    }

    console.log(`📤 Posting reply to question ID ${questionId}:`, { username, replyText });

    try {
        const response = await fetch(`http://localhost:3000/questions/${questionId}/reply`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, replyText })
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const newReply = await response.json();
        addReplyToUI(questionId, newReply);

        document.getElementById(`reply-text-${questionId}`).value = "";
        document.getElementById(`reply-username-${questionId}`).value = "";

        console.log("✅ Reply posted successfully!");
    } catch (error) {
        console.error("❌ Error posting reply:", error);
    }
}


function addReplyToUI(questionId, reply) {
    console.log(`📌 Adding reply to UI for question ID ${questionId}:`, reply);

    const repliesContainer = document.getElementById(`replies-${questionId}`);

    if (!repliesContainer) {
        console.error("❌ ERROR: Replies container not found for question", questionId);
        return;
    }

    const replyElement = document.createElement("div");
    replyElement.classList.add("reply-box");
    replyElement.innerHTML = `<strong>${reply.username}:</strong> ${reply.replyText}`;
    
    repliesContainer.appendChild(replyElement);

    // ✅ Increase the reply count
    const replyCounter = document.getElementById(`reply-count-${questionId}`);
    if (replyCounter) {
        let count = parseInt(replyCounter.innerText) || 0;
        replyCounter.innerText = `${count + 1} Replies`;
    }
}

// ✅ Function to Increase Like Count
async function likeQuestion(questionId, button) {
    try {
        const response = await fetch(`http://localhost:3000/questions/${questionId}/like`, {
            method: "POST"
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const updatedQuestion = await response.json();

        // ✅ Update the like counter dynamically
        const likeCounter = button.querySelector(".like-counter");
        likeCounter.textContent = updatedQuestion.likes;
    } catch (error) {
        console.error("❌ Error updating likes:", error);
    }
}
