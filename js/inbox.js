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

const conversationList =
document.getElementById("conversationList");
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
/*function openConversation(userId, conversation){
    ("Open:", userId);
}*/
let activeUserId = null;
let selectedAttachment = null;
async function openConversation(userId, conversationName){
    ("Opening conversation with", userId);
    activeUserId = userId;
    const token = localStorage.getItem("token");
    const empty =
    document.getElementById("emptyChat");
    const chatPanel =
    document.getElementById("chatPanel");
    empty.style.display = "none";
    chatPanel.style.display = "flex";
    const res = await fetch(
        `https://acity-backend.onrender.com/api/messages/conversation/${userId}`,
        {
            headers:{
                Authorization:`Bearer ${token}`
            }
        }
    );
    (res.status);
    const messages = await res.json();
    (messages);
    const header =
document.getElementById("chatHeader");

header.innerHTML = `
<button
    class="back-btn"
    onclick="backToInbox()"
>
    <i class="fa-solid fa-arrow-left"></i>
</button>

<div class="chat-user">

    <div class="conversation-avatar">

        ${(conversationName || "U").charAt(0).toUpperCase()}

    </div>

    <div>

        <h3>

            ${conversationName || "Conversation"}

        </h3>

        <small>

            Active conversation

        </small>

    </div>

</div>
`;

const context =
document.getElementById("conversationContext");

const listing =
JSON.parse(
    localStorage.getItem("conversationListing")
);

const service =
JSON.parse(
    localStorage.getItem("conversationService")
);

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

    localStorage.removeItem(
        "conversationListing"
    );

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

    localStorage.removeItem(
        "conversationService"
    );

}
    
    renderConversation(messages);
    const container =
    document.getElementById(
        "messagesContainer"
    );

    container.scrollTop =
    container.scrollHeight;
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

        loadInbox();

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