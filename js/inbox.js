const inboxContainer = document.getElementById("inboxContainer");

async function loadInbox() {

    const token = localStorage.getItem("token");

    try {

        const res = await fetch(
            "http://localhost:5000/api/messages/conversations",
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const messages = await res.json();

        inboxContainer.innerHTML = "";

        if (messages.length === 0) {
            inboxContainer.innerHTML =
                "<p>No messages yet.</p>";
            return;
        }

        messages.forEach(msg => {

            const card =
                document.createElement("div");

            card.classList.add("card");

            card.innerHTML = `
                <h3>${msg.conversation_name}</h3>
                <p>${msg.message}</p>

                <button
                    onclick="openConversation(${msg.conversation_user_id})"
                >
                    Open Conversation
                </button>

                <small>
                    ${new Date(msg.created_at)
                        .toLocaleString()}
                </small>
            `;

            inboxContainer.appendChild(card);

        });

    } catch (err) {

        console.error(err);

    }

}

function openConversation(userId) {

    localStorage.setItem(
        "receiver_id",
        userId
    );

    window.location.href =
        "conversation.html";

}

loadInbox();