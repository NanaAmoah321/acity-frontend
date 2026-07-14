console.log(
    JSON.parse(localStorage.getItem("conversationListing"))
);
const socket = io(
    "https://acity-backend.onrender.com"
);

const currentUser =
JSON.parse(
    localStorage.getItem("user")
);

if(currentUser){

    socket.emit(
        "join",
        currentUser.id
    );

}


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
    const token = localStorage.getItem("token");
    try {
        conversationList.innerHTML = "";
        for(let i=0;i<5;i++){
        conversationList.innerHTML += `
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
        conversationList.innerHTML = "";
        if(messages.length === 0){
            conversationList.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-comments"></i>
                    <h3>No Conversations</h3>
                    <p>Your messages will appear here.</p>
                </div>
            `;
            return;
        }
        messages.forEach(msg => {
            (msg);
            const card =
                document.createElement("div");
            card.dataset.userId =
            msg.conversation_user_id;
            card.classList.add("conversation-card");
            card.innerHTML = `
<div class="conversation-avatar">
    ${msg.conversation_name?.charAt(0).toUpperCase() || "U"}
</div>
<div class="conversation-content">
    <div class="conversation-top">
        <span class="conversation-name">
            ${msg.conversation_name || "Conversation"}
        </span>
        <span class="conversation-time">
            ${new Date(msg.created_at).toLocaleTimeString([],{
                hour:"2-digit",
                minute:"2-digit"
            })}
        </span>
    </div>
    <div class="conversation-item">
        Marketplace
    </div>
    <div class="conversation-preview">
        ${msg.message}
    </div>
</div>
`;
card.onclick = () => {

    openConversation(

        msg.conversation_user_id,

        msg.conversation_name

    );

    if(window.innerWidth <= 900){

        document.querySelector(".conversation-sidebar").style.display = "none";

        document.querySelector(".chat-area").classList.add("active");

    }

};
            conversationList.appendChild(card);
        });
    } catch (err) {
        console.error(err);
    }
}

let activeUserId = null;
let selectedAttachment = null;


async function openConversation(userId, conversationName){
    console.log("Opening conversation with", userId);
    activeUserId = userId;
    
    const token = localStorage.getItem("token");
    const empty = document.getElementById("emptyChat");
    const chatPanel = document.getElementById("chatPanel");
    
    if (empty) empty.style.display = "none";
    if (chatPanel) chatPanel.style.display = "flex";
    
    const res = await fetch(
        `https://acity-backend.onrender.com/api/messages/conversation/${userId}`,
        {
            headers:{
                Authorization:`Bearer ${token}`
            }
        }
    );
    
    console.log("Fetch status:", res.status);
    const messages = await res.json();
    console.log("Fetched messages:", messages);

    // Dynamic Name Recovery Logic:
    // If conversationName was not passed or is invalid, we inspect the loaded messages 
    // to pull the real receiver name dynamically.
    let resolvedName = conversationName;
    
    if (!resolvedName || resolvedName === "null" || resolvedName === "undefined" || resolvedName === "Chat") {
        // Try to find a message in the conversation history where the other user is involved
        const representativeMessage = messages.find(m => m.sender_id != userId || m.receiver_id != userId);
        
        if (representativeMessage) {
            // Check if the API returned populated user structures (e.g., sender_name or profile)
            if (representativeMessage.sender_id == userId) {
                resolvedName = representativeMessage.sender_name || representativeMessage.sender_full_name;
            } else {
                resolvedName = representativeMessage.receiver_name || representativeMessage.receiver_full_name;
            }
        }
        
        // If the messages didn't have readable name fields, we default to the UI sidebar fallback
        if (!resolvedName) {
            const sidebarCard = document.querySelector(`.conversation-card[data-user-id="${userId}"] h4`);
            resolvedName = sidebarCard ? sidebarCard.textContent.trim() : "User";
        }
    }
    
    const header = document.getElementById("chatHeader");
    if (header) {
        header.innerHTML = `
        <div class="chat-user">
            <button
                class="back-btn"
                onclick="backToInbox()"
            >
                <i class="fa-solid fa-arrow-left"></i>
            </button>

            <div class="conversation-avatar">
                ${resolvedName.charAt(0).toUpperCase()}
            </div>

            <div>
                <h3>${resolvedName}</h3>
                <small>Active conversation</small>
            </div>
        </div>

        <button
            id="reviewBtn"
            class="btn btn-outline btn-sm"
        >
            <i class="fa-solid fa-star"></i>
            Leave Review
        </button>
        `;
    }

    const reviewBtn = document.getElementById("reviewBtn");
    if (reviewBtn) {
        reviewBtn.addEventListener("click", () => {
            const reviewModal = document.getElementById("reviewModal");
            if (reviewModal) {
                reviewModal.classList.add("active");
            }
        });
        reviewBtn.style.display = "inline-flex";
    }

    const context = document.getElementById("conversationContext");
    if (context) {
        const listing = JSON.parse(localStorage.getItem("conversationListing"));
        const service = JSON.parse(localStorage.getItem("conversationService"));

        context.style.display = "none";
        context.innerHTML = "";

        if(listing){
            context.style.display = "block";
            context.innerHTML = `
                <div class="context-card">
                    <img
                        class="context-image"
                        src="${listing.image || `images/${listing.category}.jpg`}"
                        onerror="this.src='images/Other.jpg'"
                    >
                    <div class="context-info">
                        <div class="context-type">
                            Marketplace Item
                        </div>
                        <div class="context-title">
                            ${listing.title}
                        </div>
                        <div class="context-subtitle">
                            GH₵${listing.price}
                        </div>
                    </div>
                </div>
            `;
            localStorage.removeItem("conversationListing");
        }
        else if(service){
            context.style.display = "block";
            context.innerHTML = `
                <div class="context-card">
                    <div class="context-image">
                        <i class="fa-solid fa-briefcase"></i>
                    </div>
                    <div class="context-info">
                        <div class="context-type">
                            Service
                        </div>
                        <div class="context-title">
                            ${service.title}
                        </div>
                        <div class="context-subtitle">
                            ${service.category}
                        </div>
                    </div>
                </div>
            `;
            localStorage.removeItem("conversationService");
        }
    }

    renderConversation(messages);
    
    const container = document.getElementById("messagesContainer");
    if (container) {
        container.scrollTop = container.scrollHeight;
    }
}
function createMessageBubble(message){

    const bubble =
    document.createElement("div");

    bubble.dataset.messageId =
    message.id;

    bubble.className =
        `message ${
            message.sender_id ==
            currentUser.id
            ? "sent"
            : "received"
        }`;

    bubble.innerHTML = `
        
            ${
                message.message?.trim()
                ?
                `<div>${message.message}</div>`
                :
                ""
            }
        

        ${
            message.file_url
            ?
            message.file_type &&
            message.file_type.startsWith("image/")
            ?
            `
            <img
                src="${message.file_url}"
                class="chat-image"
            >
            `
            :
            `
            <a
                href="${message.file_url}"
                target="_blank"
                class="chat-file"
            >
                <i class="fa-solid fa-file"></i>
                ${message.file_name}
            </a>
            `
            :
            ""
        }

        <span class="message-time">

            ${new Date(message.created_at)
            .toLocaleTimeString([],{

                hour:"2-digit",

                minute:"2-digit"

            })}

        </span>
    `;

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