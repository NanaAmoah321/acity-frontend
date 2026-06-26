const inboxContainer = document.getElementById("inboxContainer");

async function loadInbox() {

    const token = localStorage.getItem("token");

    try {

        inboxContainer.innerHTML = "";

        for(let i=0;i<5;i++){

        inboxContainer.innerHTML += `
        <div class="inbox-skeleton skeleton-card">
        </div>
        `;

        }

        const res = await fetch(
            "https://acity-backend.onrender.com/api/messages/conversations",
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const messages = await res.json();

        inboxContainer.innerHTML = "";

        if(messages.length === 0){

            inboxContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-comments"></i>
                    <h3>No Conversations</h3>
                    <p>Your messages will appear here.</p>
                </div>
            `;

            return;
        }

        

        messages.forEach(msg => {

            console.log(msg);

            const card =
                document.createElement("div");

            card.classList.add("inbox-card");

            card.innerHTML = `
                <div class="inbox-avatar">
                    <i class="fa-solid fa-user"></i>
                </div>

                <div class="inbox-info">
                    <div class="inbox-top">
                        <h4>${msg.conversation_name}</h4>
                        <span>
                            ${new Date(msg.created_at)
                                .toLocaleTimeString([], {
                                    hour:"2-digit",
                                    minute:"2-digit"
                                })}
                            </span>
                        </div>

                        <p>${msg.message}</p>
                    </div>
            `;  

            card.onclick = () => {
                localStorage.setItem(
                    "receiver_id",
                    msg.conversation_user_id
                );

                window.location =
                "conversation.html";
            };

            inboxContainer.appendChild(card);

        });

    } catch (err) {

        console.error(err);

    }

}



loadInbox();