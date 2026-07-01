let allNotifications = [];
let currentFilter = "all";

const container =
document.getElementById(
    "notificationsContainer"
);



async function loadNotifications(){

    const token =
    localStorage.getItem("token");

    if(!container) return;

    container.innerHTML = "";

    // Skeletons
    for(let i=0;i<5;i++){

        container.innerHTML += `
            <div class="notification-skeleton skeleton-card"></div>
        `;

    }

    const res =
    await fetch(
        "https://acity-backend.onrender.com/api/notifications",
        {
            headers:{
                Authorization:
                `Bearer ${token}`
            }
        }
    );

    allNotifications =
    await res.json();

    container.innerHTML = "";

    if(allNotifications.length===0){

        container.innerHTML=`

        <div class="empty-state">

            <i class="fa-solid fa-bell-slash"></i>

            <h3>No Notifications</h3>

            <p>
                You're all caught up.
            </p>

        </div>

        `;

        return;

    }

    renderNotifications();

}

function renderNotifications(){

    container.innerHTML = "";

    const filtered =

    currentFilter === "all"

    ?

    allNotifications

    :

    allNotifications.filter(

        notification =>

        notification.type === currentFilter

    );

    if(filtered.length === 0){

        container.innerHTML = `

        <div class="empty-state">

            <i class="fa-solid fa-bell-slash"></i>

            <h3>No Notifications</h3>

            <p>

                Nothing here yet.

            </p>

        </div>

        `;

        return;

    }

    filtered.forEach(notification=>{

        container.innerHTML += `

        <div
            class="notification-card ${notification.is_read ? "" : "unread"}"
            onclick="openNotification(
                ${notification.id},
                '${notification.type}',
                ${notification.conversation_user_id}
            )"
        >

            <div class="notification-icon icon-${notification.type}">

                ${getNotificationIcon(notification.type)}

            </div>

            <div class="notification-content">

                <div class="notification-top">

                    <h3>
                        ${notification.title}
                    </h3>

                    <span class="notification-time">

                        ${timeAgo(notification.created_at)}

                    </span>

                </div>

                <p class = "notification-message">

                    ${notification.message}

                </p>

                <div class="notification-product">

                ${
                    notification.type === "order"
                        ? `<i class="fa-solid fa-box"></i> Marketplace Order`
                    : notification.type === "message"
                        ? `<i class="fa-solid fa-comments"></i> New Conversation`
                    : notification.type === "review"
                        ? `<i class="fa-solid fa-star"></i> Review`
                    : notification.type === "accepted"
                        ? `<i class="fa-solid fa-circle-check"></i> Accepted`
                    : notification.type === "rejected"
                        ? `<i class="fa-solid fa-circle-xmark"></i> Rejected`
                    : `<i class="fa-solid fa-bell"></i> Notification`
                }

                </div>

            </div>

            ${
                !notification.is_read
                ? `<div class="notification-dot"></div>`
                : ""
            }

            <div class="notification-arrow">

                <i class="fa-solid fa-chevron-right"></i>

            </div>

        </div>

        `;

    });

}

async function openNotification(id, type, conversationUserId) {

    const token = localStorage.getItem("token");

    await fetch(
        `https://acity-backend.onrender.com/api/notifications/${id}/read`,
        {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

   if (type === "message") {

    if (!conversationUserId) {
        alert("Conversation not found.");
        return;
    }

    localStorage.setItem(
        "openConversationWith",
        conversationUserId
    );

    window.location.href = "inbox.html";
    return;
    }

    if (type === "order") {
        window.location.href = "profile.html";
    }
}

function getNotificationIcon(type){

    switch(type){

        case "order":
            return `<i class="fa-solid fa-box"></i>`;

        case "message":
            return `<i class="fa-solid fa-comments"></i>`;

        case "review":
            return `<i class="fa-solid fa-star"></i>`;

        case "service":
            return `<i class="fa-solid fa-screwdriver-wrench"></i>`;

        case "accepted":
            return `<i class="fa-solid fa-circle-check"></i>`;

        case "rejected":
            return `<i class="fa-solid fa-circle-xmark"></i>`;

        default:
            return `<i class="fa-solid fa-bell"></i>`;
    }

}

function timeAgo(date){

    const seconds =
    Math.floor(
        (Date.now() - new Date(date))
        /1000
    );

    if(seconds < 60)
        return "Just now";

    if(seconds < 3600)
        return `${Math.floor(seconds/60)} min ago`;

    if(seconds < 86400)
        return `${Math.floor(seconds/3600)} hr ago`;

    return `${Math.floor(seconds/86400)} days ago`;

}

document
.querySelectorAll(".notification-filter")
.forEach(button=>{

    button.addEventListener(

        "click",

        ()=>{

            document

            .querySelectorAll(".notification-filter")

            .forEach(btn=>

                btn.classList.remove("active")

            );

            button.classList.add("active");

            currentFilter =

            button.dataset.filter;

            renderNotifications();

        }

    );

});
const markAllReadBtn =
document.getElementById(
    "markAllRead"
);

if(markAllReadBtn){

    markAllReadBtn.addEventListener(

        "click",

        async()=>{

            const token =
            localStorage.getItem("token");

            await fetch(

                "https://acity-backend.onrender.com/api/notifications/read-all",

                {

                    method:"PATCH",

                    headers:{
                        Authorization:`Bearer ${token}`
                    }

                }

            );

            loadNotifications();

            if(window.updateNotificationCount){

                window.updateNotificationCount();

            }

        }

    );

}
loadNotifications();
