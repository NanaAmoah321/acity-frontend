const currentUser =
    JSON.parse(localStorage.getItem("user"));

const token = localStorage.getItem("token");

if (!token || !currentUser) {
    window.location.replace("login.html");
    throw new Error("Authentication required");
}

function safeUrl(value) {
    try {
        const url = new URL(value, window.location.origin);

        if (
            url.protocol === "https:" ||
            url.origin === window.location.origin
        ) {
            return url.href;
        }
    } catch {
        return null;
    }

    return null;
}

const socket = io(
    "https://acity-backend.onrender.com"
);

socket.emit(
    "join",
    currentUser.id
);


const reviewModal =
document.getElementById(
    "reviewModal"
);

const closeReview =
document.getElementById(
    "closeReview"
);

const conversationList =
document.getElementById("conversationList");

function updateConversationCard(message){

    const otherUserId =
    message.sender_id == currentUser.id
        ? message.receiver_id
        : message.sender_id;

    const card =
    document.querySelector(
        `.conversation-card[data-user-id="${otherUserId}"]`
    );

    if(!card){

        loadInbox();
        return;

    }

    const preview =
    card.querySelector(
        ".conversation-preview"
    );

    preview.textContent =
    message.message ||
    "Attachment";

    const time =
    card.querySelector(
        ".conversation-time"
    );

    time.textContent =
    new Date(message.created_at)
    .toLocaleTimeString([],{

        hour:"2-digit",

        minute:"2-digit"

    });

    conversationList.prepend(card);

}

async function loadInbox() {
    try {
        conversationList.innerHTML = "";

        for (let i = 0; i < 5; i++) {
            conversationList.innerHTML += `
                <div class="inbox-skeleton skeleton-card"></div>
            `;
        }

        const res = await fetch(
            "https://acity-backend.onrender.com/api/messages/conversations",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (res.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.replace("login.html");
            return;
        }

        if (!res.ok) {
            throw new Error("Could not load conversations.");
        }

        const messages = await res.json();

        if (!Array.isArray(messages)) {
            throw new Error("Invalid conversations response.");
        }

        conversationList.replaceChildren();

        if (messages.length === 0) {
            conversationList.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-comments"></i>
                    <h3>No Conversations</h3>
                    <p>Your messages will appear here.</p>
                </div>
            `;
            return;
        }

        messages.forEach(message => {
            const card = document.createElement("div");

            card.setAttribute("role", "button");
            card.tabIndex = 0;
            card.dataset.userId = message.conversation_user_id;
            card.className = "conversation-card";

            const avatar = document.createElement("div");
            avatar.className = "conversation-avatar";
            avatar.textContent =
                (message.conversation_name || "U")
                    .charAt(0)
                    .toUpperCase();

            const content = document.createElement("div");
            content.className = "conversation-content";

            const top = document.createElement("div");
            top.className = "conversation-top";

            const name = document.createElement("span");
            name.className = "conversation-name";
            name.textContent =
                message.conversation_name || "Conversation";

            const time = document.createElement("span");
            time.className = "conversation-time";
            time.textContent = new Date(
                message.created_at
            ).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            });

            top.append(name, time);

            const item = document.createElement("div");
            item.className = "conversation-item";
            item.textContent = "Marketplace";

            const preview = document.createElement("div");
            preview.className = "conversation-preview";
            preview.textContent = message.message || "Attachment";

            content.append(top, item, preview);
            card.append(avatar, content);

            card.addEventListener("click", () => {
                openConversation(
                    message.conversation_user_id,
                    message.conversation_name
                );

                if (window.innerWidth <= 900) {
                    document.querySelector(
                        ".conversation-sidebar"
                    ).style.display = "none";

                    document.querySelector(
                        ".chat-area"
                    ).classList.add("active");
                }
            });

            conversationList.appendChild(card);
        });
    } catch (err) {
        console.error("Inbox load error:", err);

        conversationList.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <h3>Could not load conversations</h3>
                <p>Please refresh the page and try again.</p>
            </div>
        `;
    }
}

let activeUserId = null;
let selectedAttachment = null;

function readStoredJSON(key) {
    try {
        return JSON.parse(localStorage.getItem(key));
    } catch {
        return null;
    }
}

async function openConversation(userId, conversationName) {
    activeUserId = Number(userId);

    const empty = document.getElementById("emptyChat");
    const chatPanel = document.getElementById("chatPanel");
    const header = document.getElementById("chatHeader");
    const context = document.getElementById("conversationContext");
    const messagesContainer =
        document.getElementById("messagesContainer");

    if (empty) {
        empty.style.display = "none";
    }

    if (chatPanel) {
        chatPanel.style.display = "flex";
    }

    if (messagesContainer) {
        messagesContainer.innerHTML = `
            <div class="inbox-skeleton skeleton-card"></div>
            <div class="inbox-skeleton skeleton-card"></div>
            <div class="inbox-skeleton skeleton-card"></div>
        `;
    }

    try {
        const res = await fetch(
            `https://acity-backend.onrender.com/api/messages/conversation/${activeUserId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (res.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.replace("login.html");
            return;
        }

        if (!res.ok) {
            throw new Error("Could not load this conversation.");
        }

        const messages = await res.json();

        if (!Array.isArray(messages)) {
            throw new Error("Invalid conversation response.");
        }

        let resolvedName = conversationName;

        if (
            !resolvedName ||
            resolvedName === "null" ||
            resolvedName === "undefined" ||
            resolvedName === "Chat"
        ) {
            const representativeMessage = messages.find(
                message =>
                    Number(message.sender_id) === activeUserId ||
                    Number(message.receiver_id) === activeUserId
            );

            if (representativeMessage) {
                const otherUserSentMessage =
                    Number(representativeMessage.sender_id) === activeUserId;

                resolvedName = otherUserSentMessage
                    ? (
                        representativeMessage.sender_name ||
                        representativeMessage.sender_full_name
                    )
                    : (
                        representativeMessage.receiver_name ||
                        representativeMessage.receiver_full_name
                    );
            }
        }

        resolvedName = resolvedName || "User";

        if (header) {
            header.replaceChildren();

            const chatUser = document.createElement("div");
            chatUser.className = "chat-user";

            const backButton = document.createElement("button");
            backButton.type = "button";
            backButton.className = "back-btn";
            backButton.innerHTML =
                `<i class="fa-solid fa-arrow-left"></i>`;

            backButton.addEventListener("click", backToInbox);

            const avatar = document.createElement("div");
            avatar.className = "conversation-avatar";
            avatar.textContent =
                resolvedName.charAt(0).toUpperCase();

            const details = document.createElement("div");

            const name = document.createElement("h3");
            name.textContent = resolvedName;

            const status = document.createElement("small");
            status.textContent = "Active conversation";

            details.append(name, status);
            chatUser.append(backButton, avatar, details);

            const reviewButton = document.createElement("button");
            reviewButton.type = "button";
            reviewButton.id = "reviewBtn";
            reviewButton.className = "btn btn-outline btn-sm";
            reviewButton.innerHTML = `
                <i class="fa-solid fa-star"></i>
                Leave Review
            `;

            reviewButton.addEventListener("click", () => {
                reviewModal?.classList.add("active");
            });

            header.append(chatUser, reviewButton);
        }

        if (context) {
            const listing = readStoredJSON("conversationListing");
            const service = readStoredJSON("conversationService");

            context.replaceChildren();
            context.style.display = "none";

            if (listing) {
                context.style.display = "block";

                const card = document.createElement("div");
                card.className = "context-card";

                const image = document.createElement("img");
                image.className = "context-image";
                image.alt = "Marketplace item";
                image.src =
                    safeUrl(listing.image_url || listing.image) ||
                    "images/Other.jpg";

                image.onerror = () => {
                    image.src = "images/Other.jpg";
                };

                const info = document.createElement("div");
                info.className = "context-info";

                const type = document.createElement("div");
                type.className = "context-type";
                type.textContent = "Marketplace Item";

                const title = document.createElement("div");
                title.className = "context-title";
                title.textContent = listing.title || "Marketplace Item";

                const price = document.createElement("div");
                price.className = "context-subtitle";
                price.textContent =
                    `GH₵${Number(listing.price || 0).toFixed(2)}`;

                info.append(type, title, price);
                card.append(image, info);
                context.appendChild(card);

                localStorage.removeItem("conversationListing");
            } else if (service) {
                context.style.display = "block";

                const card = document.createElement("div");
                card.className = "context-card";

                const icon = document.createElement("div");
                icon.className = "context-image";
                icon.innerHTML =
                    `<i class="fa-solid fa-briefcase"></i>`;

                const info = document.createElement("div");
                info.className = "context-info";

                const type = document.createElement("div");
                type.className = "context-type";
                type.textContent = "Service";

                const title = document.createElement("div");
                title.className = "context-title";
                title.textContent = service.title || "Service";

                const category = document.createElement("div");
                category.className = "context-subtitle";
                category.textContent = service.category || "Other";

                info.append(type, title, category);
                card.append(icon, info);
                context.appendChild(card);

                localStorage.removeItem("conversationService");
            }
        }

        renderConversation(messages);

        if (messagesContainer) {
            messagesContainer.scrollTop =
                messagesContainer.scrollHeight;
        }
    } catch (err) {
        console.error("Conversation load error:", err);

        if (messagesContainer) {
            messagesContainer.innerHTML = `
                <div class="empty-chat">
                    <h3>Could not load this conversation</h3>
                    <p>Please try again.</p>
                </div>
            `;
        }

        showToast("Could not load this conversation.", "error");
    }
}

function createMessageBubble(message) {
    const bubble = document.createElement("div");

    bubble.dataset.messageId = message.id;

    bubble.className =
        `message ${
            Number(message.sender_id) === Number(currentUser.id)
                ? "sent"
                : "received"
        }`;

    if (message.message?.trim()) {
        const text = document.createElement("div");
        text.className = "message-text";
        text.textContent = message.message;
        bubble.appendChild(text);
    }

    if (message.file_url) {
        const fileUrl = safeUrl(message.file_url);

        if (fileUrl) {
            if (message.file_type?.startsWith("image/")) {
                const image = document.createElement("img");

                image.src = fileUrl;
                image.alt = "Message attachment";
                image.className = "chat-image";

                bubble.appendChild(image);
            } else {
                const file = document.createElement("a");

                file.href = fileUrl;
                file.target = "_blank";
                file.rel = "noopener noreferrer";
                file.className = "chat-file";
                file.textContent =
                    message.file_name || "Open attachment";

                bubble.appendChild(file);
            }
        }
    }

    const time = document.createElement("span");

    time.className = "message-time";
    time.textContent = new Date(
        message.created_at
    ).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

    bubble.appendChild(time);

    return bubble;
}

function renderConversation(messages){
    const container =
    document.getElementById("messagesContainer");
    container.innerHTML = "";
    if(messages.length === 0){
        container.innerHTML = `
        <div class="empty-chat">
            <h3>No messages yet</h3>
            <p>
                Start the conversation.
            </p>
        </div>
        `;
        return;
    }
    messages.forEach(message=>{

    container.appendChild(
        createMessageBubble(message)
    );

    });
}




document
.getElementById("messageForm")
.addEventListener("submit",sendMessage);

async function sendMessage(e){
    e.preventDefault();
    const input =
    document.getElementById("messageInput");
    if(
        !input.value.trim()
        &&
        !selectedAttachment
    ) return;
    const token =
    localStorage.getItem("token");
    const formData =
    new FormData();
    formData.append(
        "receiver_id",
        activeUserId
    );
    formData.append(
        "message",
        input.value
    );
    if(selectedAttachment){
        formData.append(
            "attachment",
            selectedAttachment
        );
    }
    const res = await fetch(
        "https://acity-backend.onrender.com/api/messages",
        {
            method:"POST",
            headers:{
                Authorization:`Bearer ${token}`
            },
            body:formData
        }
    );
    const data =
    await res.json();
    if(!res.ok){
        showToast(
            data.error ||
            "Failed to send",
            "error"
        );
        return;
    }
    input.value = "";
    selectedAttachment = null;
    document.getElementById(
        "attachmentInput"
    ).value = "";
    
}

function backToInbox(){
    document.querySelector(".chat-area").classList.remove("active");
    document.querySelector(".conversation-sidebar").style.display = "block";
}
const attachBtn =
document.getElementById("attachBtn");
const attachmentInput =
document.getElementById("attachmentInput");
attachBtn.addEventListener(
    "click",
    ()=>{
        attachmentInput.click();
    }
);
attachmentInput.addEventListener(
    "change",
    ()=>{
        selectedAttachment =
        attachmentInput.files[0];
        if(selectedAttachment){
            showToast(
                `${selectedAttachment.name} selected`
            );
        }
    }
);


loadInbox().then(() => {

    const userId =
    localStorage.getItem("openConversationWith");

    const conversationName =
    localStorage.getItem("openConversationName");

    if(userId){

        console.log("openConversationWith:", userId);
        console.log("Number:", Number(userId));

        openConversation(

            Number(userId),

            conversationName

        );

        localStorage.removeItem(
            "openConversationWith"
        );

        localStorage.removeItem(
            "openConversationName"
        );

        if(window.innerWidth <= 900){

            document.querySelector(
                ".conversation-sidebar"
            ).style.display = "none";

            document.querySelector(
                ".chat-area"
            ).classList.add("active");

        }

    }

});
socket.on(
    "new_message",
    (message)=>{

        updateConversationCard(
            message
        );

        if(
            activeUserId &&
            (
                message.sender_id == activeUserId ||
                message.receiver_id == activeUserId
            )
        ){

            const container =
            document.getElementById(
                "messagesContainer"
            );

            if(
                document.querySelector(
                    `[data-message-id="${message.id}"]`
                )
            ){
                return;
            }

            container.appendChild(
                createMessageBubble(message)
            );

            container.scrollTop =
            container.scrollHeight;

        }

    }
);



closeReview.addEventListener(
    "click",
    ()=>{

        reviewModal.classList.remove(
            "active"
        );

    }
);

document
.getElementById("submitReview")
.addEventListener(
    "click",
    async ()=>{

        const token =
        localStorage.getItem("token");

        const rating =
        document.getElementById(
            "rating"
        ).value;

        const comment =
        document.getElementById(
            "reviewComment"
        ).value;

        const res =
        await fetch(
            "https://acity-backend.onrender.com/api/reviews",
            {
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                    Authorization:`Bearer ${token}`
                },
                body:JSON.stringify({

                    reviewed_user_id:
                    activeUserId,

                    rating,

                    comment

                })
            }
        );

        const data =
        await res.json();

        if(res.ok){

            showToast(
                "Review submitted"
            );

            reviewModal.classList.remove(
                "active"
            );

        }else{

            showToast(
                data.error,
                "error"
            );

        }

    }
);