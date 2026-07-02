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

            console.log(msg);

            const card =
                document.createElement("div");

            card.classList.add("conversation-card");

            card.innerHTML = `

<div class="conversation-avatar">

    ${msg.conversation_name.charAt(0).toUpperCase()}

</div>

<div class="conversation-content">

    <div class="conversation-top">

        <span class="conversation-name">

            ${msg.conversation_name}

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

    openConversation(msg.conversation_user_id);

    if(window.innerWidth <= 900){

        document.querySelector(".conversation-sidebar").style.display = "none";

        document.querySelector(".chat-area").classList.add("active");

        /*document.getElementById("chatPanel").style.display = "flex";

        document.getElementById("emptyChat").style.display = "none";*/
    }

};

            conversationList.appendChild(card);

        });

    } catch (err) {

        console.error(err);

    }

}

/*function openConversation(userId, conversation){

    console.log("Open:", userId);

}*/

let activeUserId = null;
let selectedAttachment = null;

async function openConversation(userId){

    console.log("Opening conversation with", userId);


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
    console.log(res.status);

    const messages = await res.json();

    console.log(messages);

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
        ${messages[0]?.sender_name?.charAt(0) || "U"}
    </div>

    <div>

        <h3>
            ${messages[0]?.sender_name || "Conversation"}
        </h3>

        <small>
            Active conversation
        </small>

    </div>

</div>

`;

    renderConversation(messages);

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

        const bubble =
        document.createElement("div");

        bubble.className =

            `message ${
                message.sender_id ==
                JSON.parse(localStorage.getItem("user")).id

                ?

                "sent"

                :

                "received"

            }`;

        bubble.innerHTML = `

    ${
        message.message
        ?
        `<div>${message.message}</div>`
        :
        ""
    }

    ${
        message.file_url

        ?

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

        container.appendChild(bubble);

    });

    container.scrollTop =
    container.scrollHeight;

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

    openConversation(

        activeUserId

    );

}

/*function backToInbox(){

    if(window.innerWidth <= 900){

        document.querySelector(".conversation-sidebar").style.display = "block";

        document.querySelector(".chat-area").style.display = "none";

    }

}*/

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

    if(userId){

        openConversation(Number(userId));

        localStorage.removeItem(
            "openConversationWith"
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