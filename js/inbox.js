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

let conversations = [];

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

function renderConversationList(messages){
    conversationList.replaceChildren();

    if(messages.length === 0){

        showNoSearchResults();

        return;

    }

    messages.forEach(message => {
        const card = document.createElement("div");

        card.setAttribute("role", "button");
        card.tabIndex = 0;
        card.dataset.userId = message.conversation_user_id;
        card.className = "conversation-card";

        let avatar;

        if (message.other_user_profile_picture) {

            avatar = document.createElement("img");
            avatar.className = "conversation-avatar";
            avatar.src = message.other_user_profile_picture;
            avatar.alt = message.conversation_name || "User";

            avatar.onerror = () => {
                avatar.replaceWith(
                    createInitialAvatar(message.conversation_name)
                );
            };

        } else {

            avatar = createInitialAvatar(
                message.conversation_name
            );

        }

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

}

function createInitialAvatar(name) {

    const div = document.createElement("div");

    div.className = "conversation-avatar";

    div.textContent =
        (name || "U").charAt(0).toUpperCase();

    return div;

}

function showEmptyInbox(){

    conversationList.innerHTML = `
        <div class="empty-state">

            <div class="empty-icon">
                <i class="fa-regular fa-comments"></i>
            </div>

            <h3>Welcome to your Inbox</h3>

            <p>
                Your conversations with buyers,
                sellers and service providers
                will appear here.
            </p>

            <a
                href="marketplace.html"
                class="btn btn-primary"
            >
                Browse Marketplace
            </a>

        </div>
    `;

}

function showNoSearchResults(){

    const search =
    document.getElementById(
        "conversationSearch"
    );

    const query =
    search?.value || "";

    conversationList.innerHTML = `
        <div class="empty-state">

            <div class="empty-icon">
                <i class="fa-solid fa-magnifying-glass"></i>
            </div>

            <h3>No conversations found</h3>

            <p>
                No conversations match
                "<strong>${query}</strong>".
            </p>

            <button
                class="btn btn-outline"
                id="clearConversationSearch"
            >
                Clear Search
            </button>

        </div>
    `;

    document
    .getElementById(
        "clearConversationSearch"
    )
    .addEventListener("click",()=>{

        search.value = "";

        renderConversationList(
            conversations
        );

        search.focus();

    });

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

        conversations = messages;

        if (!Array.isArray(messages)) {
            throw new Error("Invalid conversations response.");
        }

        conversationList.replaceChildren();

        if(messages.length === 0){

            showEmptyInbox();

            return;

        }

        renderConversationList(messages);

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

const improveMessageBtn =
document.getElementById(
    "improveMessageBtn"
);

let latestSuggestedReplies = [];
const smartReplyCache = new Map();

function readStoredJSON(key) {
    try {
        return JSON.parse(localStorage.getItem(key));
    } catch {
        return null;
    }
}

async function openConversation(userId, conversationName) {
    const conversationUserId = Number(userId);

    const currentUser = JSON.parse(localStorage.getItem("user"));
    const currentUserId = Number(currentUser.id);

    activeUserId = conversationUserId; 

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
            resolvedName === "Chat" ||
            resolvedName === "New"
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

            const firstMessage = messages[0];

            const profilePicture =
                firstMessage?.other_user_profile_picture;

            let avatar;

            if (profilePicture) {

                avatar = document.createElement("img");
                avatar.className = "conversation-avatar";
                avatar.src = profilePicture;
                avatar.alt = resolvedName;

                avatar.onerror = () => {
                    avatar.replaceWith(
                        createInitialAvatar(resolvedName)
                    );
                };

            } else {

                avatar = createInitialAvatar(resolvedName);

            }

            // Helper to generate text initial fallback
            function createInitialAvatar(name) {
                const div = document.createElement("div");
                div.className = "conversation-avatar";
                div.textContent = (name || "U").charAt(0).toUpperCase();
                return div;
            }

            const details = document.createElement("div");

            const name = document.createElement("h3");
            name.textContent = resolvedName;

            

            details.append(name);
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

        const lastIncomingMessage =
            [...messages]
            .reverse()
            .find(

                m =>

                Number(m.sender_id) ===
                activeUserId

            );

        if(lastIncomingMessage){

            await loadSmartReplies(

                lastIncomingMessage.message

            );

        }
        else{

            latestSuggestedReplies = [];

            renderSuggestedReplies();

        }

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

    if (

        message.detected_language &&

        message.detected_language.toLowerCase() !== "english" &&

        Number(message.receiver_id) === Number(currentUser.id)

    ) {

        const translated = document.createElement("div");

        translated.className = "translated-indicator";

        translated.innerHTML = `
            <i class="fa-solid fa-language"></i>
            Translated from ${message.detected_language}
        `;

        bubble.appendChild(translated);

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

async function improveMessage(){

    const input =
    document.getElementById(
        "messageInput"
    );

    const message =
    input.value.trim();

    if(!message){

        showToast(
            "Type a message first."
        );

        return;

    }

    

    improveMessageBtn.disabled = true;

    improveMessageBtn.innerHTML = `
    <i class="fa-solid fa-wand-magic-sparkles fa-spin"></i>
    `;

    try{

        const res =
        await fetch(

            "https://acity-backend.onrender.com/api/ai/messages/improve",

            {

                method:"POST",

                headers:{

                    "Content-Type":"application/json",

                    Authorization:
                    `Bearer ${token}`

                },

                body:JSON.stringify({

                    message

                })

            }

        );

        const data =
        await res.json();

        if(!res.ok){

            throw new Error(

                data.error?.message ||

                data.error ||

                "Unable to improve message."

            );

        }

        const improved =
            data.data.improvedMessage.trim();

        if (
            improved.toLowerCase() ===
            message.toLowerCase()
        ) {

            showToast(
                "This message is already clear enough."
            );

        } else {

            input.value = improved;

            showToast(
                "✨ Message improved"
            );

        }

        input.focus();

        input.setSelectionRange(
            input.value.length,
            input.value.length
        );

        showToast(
            "✨ Message improved"
        );

    }

    catch(error){

        console.error(error);

        showToast(

            error.message,

            "error"

        );

    }

    finally{

        improveMessageBtn.disabled = false;

        improveMessageBtn.innerHTML = `
        <i class="fa-solid fa-wand-magic-sparkles"></i>
        `;

    }

}

async function sendMessage(e){
    e.preventDefault();
    const input =
    document.getElementById("messageInput");
    if(
        !input.value.trim()
        &&
        !selectedAttachment
    ) return;
    
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


    renderSuggestedReplies();
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

    latestSuggestedReplies = [];

    renderSuggestedReplies();

    
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

async function loadSmartReplies(message){

    if(!message){

        latestSuggestedReplies = [];

        renderSuggestedReplies();

        return;

    }

    const cacheKey = message.trim();

    if(smartReplyCache.has(cacheKey)){

        latestSuggestedReplies =
            smartReplyCache.get(cacheKey);

        renderSuggestedReplies();

        return;

    }

    try{

        const res =
        await fetch(

            "https://acity-backend.onrender.com/api/messages/smart-replies",

            {

                method:"POST",

                headers:{

                    "Content-Type":"application/json",

                    Authorization:`Bearer ${token}`

                },

                body:JSON.stringify({

                    message

                })

            }

        );

        if(!res.ok){

            latestSuggestedReplies = [];

            renderSuggestedReplies();

            return;

        }

        const data =
        await res.json();

        latestSuggestedReplies =
            data.replies || [];

        smartReplyCache.set(

            cacheKey,

            latestSuggestedReplies

        );

        renderSuggestedReplies();

    }

    catch(error){

        console.error(error);

    }

}

function renderSuggestedReplies() {

    let container =
        document.getElementById(
            "aiReplies"
        );

    if (!container) {

        container =
            document.createElement("div");

        container.id = "aiReplies";

        container.className =
            "ai-replies";

        document
            .getElementById("messageForm")
            .prepend(container);

    }

    container.innerHTML = "";

    if (
        latestSuggestedReplies.length === 0
    ) {

        container.style.display = "none";

        return;

    }

    container.style.display = "flex";

    latestSuggestedReplies.forEach(reply => {

        const chip =
            document.createElement("button");

        chip.type = "button";

        chip.className =
            "ai-reply-chip";

        chip.innerHTML = `
            ✨ ${reply}
        `;

        chip.onclick = () => {

            document.getElementById(
                "messageInput"
            ).value = reply;

            document.getElementById(
                "messageInput"
            ).focus();

        };

        container.appendChild(chip);

    });

}

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
    async message => {

        updateConversationCard(message);

        if (
            activeUserId &&
            (
                message.sender_id == activeUserId ||
                message.receiver_id == activeUserId
            )
        ) {

            const container =
                document.getElementById(
                    "messagesContainer"
                );

            if (
                document.querySelector(
                    `[data-message-id="${message.id}"]`
                )
            ) {
                return;
            }

            container.appendChild(
                createMessageBubble(message)
            );

            container.scrollTop =
                container.scrollHeight;

            // Only show Smart Replies
            // when YOU receive a message

            if (
                Number(message.receiver_id) ===
                Number(currentUser.id)
            ) {

                await loadSmartReplies(message.message);

            }

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

const search =
document.getElementById("conversationSearch");

if(search){

    search.addEventListener("input",()=>{

        const value =
        search.value
        .trim()
        .toLowerCase();

        const filtered =
        conversations.filter(c=>{

            return (
                c.conversation_name || ""
            )
            .toLowerCase()
            .includes(value);

        });

        renderConversationList(filtered);

    });

}

/*const filtered =
conversations.filter(c=>{

    const name =
    (c.conversation_name || "")
    .toLowerCase();

    const preview =
    (c.message || "")
    .toLowerCase();

    return (
        name.includes(value) ||
        preview.includes(value)
    );

});*/

if(improveMessageBtn){

    improveMessageBtn.addEventListener(

        "click",

        improveMessage

    );

}