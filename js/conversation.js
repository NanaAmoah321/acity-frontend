const token =
localStorage.getItem("token");
const currentUser =
JSON.parse(
    localStorage.getItem("user")
);
const receiver_id =
localStorage.getItem("receiver_id");
("Receiver ID:", receiver_id);
const chatName =
document.getElementById("chatName");
const conversationContainer =
document.getElementById(
    "conversationContainer"
);
async function loadConversation() {
    if(!conversationContainer){
        return;
    }
    ("Token:", token);
    ("Receiver ID:", receiver_id);
    ("Current User Token:", token);
    const res = await fetch(
        `https://acity-backend.onrender.com/api/messages/conversation/${receiver_id}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    ("Status:", res.status);
    const messages = await res.json();
    if (
    messages.length > 0 &&
    chatName
    ) {
    const otherUser =
    messages.find(
        msg =>
        msg.sender_id !== currentUser.id
    );
    if (otherUser) {
        chatName.textContent =
        otherUser.sender_name;
    }
    }
    ("Messages:", messages);
    conversationContainer.innerHTML = "";
    messages.forEach(msg => {
        const div = document.createElement("div");
        if (
            msg.sender_id ===
            currentUser.id
       ) {
            div.classList.add(
                "my-message"
        );
    } else {
        div.classList.add(
            "other-message"
        );
  }
    const displayName =
        msg.sender_id === currentUser.id
        ? "Me"
        : msg.sender_name;
    div.innerHTML = `
       ${
            msg.sender_id !== currentUser.id
            ?
            `<div class="sender">
                ${msg.sender_name}
            </div>`
            :
            ""
        }
        <div class="message-text">
            ${msg.message}
        </div>
    `;
        conversationContainer.appendChild(div);
    });
}
loadConversation();
setInterval(loadConversation, 3000);
document
.getElementById("sendBtn")
.addEventListener(
    "click",
    async () => {
        const message =
        document
        .getElementById(
            "messageInput"
        )
        .value;
        await fetch(
            "https://acity-backend.onrender.com/api/messages",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                    "application/json",
                    Authorization:
                    `Bearer ${token}`
                },
                body: JSON.stringify({
                    receiver_id,
                    message
                })
            }
        );
        if(window.updateMessageCount){
            window.updateMessageCount();
        }
        document
        .getElementById(
            "messageInput"
        )
        .value = "";
        loadConversation();
        if(window.updateMessageCount){
            window.updateMessageCount();
        }
    }
);
const reviewModal =
document.getElementById("reviewModal");
document
.getElementById("reviewBtn")
.addEventListener("click", () => {
    reviewModal.classList.add("active");
});
document
.getElementById("closeReview")
.addEventListener("click", () => {
    reviewModal.classList.remove("active");
});
document
.getElementById(
    "submitReview"
)
.addEventListener(
    "click",
    async () => {
        const rating =
        document
        .getElementById(
            "rating"
        )
        .value;
        const comment =
        document
        .getElementById(
            "reviewComment"
        )
        .value;
        const res =
        await fetch(
            "https://acity-backend.onrender.com/api/reviews",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                    "application/json",
                    Authorization:
                    `Bearer ${token}`
                },
                body:
                JSON.stringify({
                    reviewed_user_id:
                    receiver_id,
                    rating,
                    comment
                })
            }
        );
        const data =
        await res.json();
        if (res.ok) {
            showToast(
                "Review submitted"
            );
        } else {
            showToast(
                data.error
            );
        }
    }
);