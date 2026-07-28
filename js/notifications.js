const token = localStorage.getItem("token");

if (!token) {
    window.location.replace("login.html");
    throw new Error("Authentication required");
}

const res = await fetch(url, options);

if (res.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.replace("login.html");
    return;
}

if (!res.ok) {
    throw new Error("Could not load this information.");
}

const data = await res.json();

let allNotifications = [];
let currentFilter = "all";
const container =
document.getElementById(
    "notificationsContainer"
);
async function loadNotifications(){
    const token = localStorage.getItem("token");
    if(!container) return;
    
    container.innerHTML = "";
    for(let i=0; i<5; i++){
        container.innerHTML += `
            <div class="notification-skeleton skeleton-card"></div>
        `;
    }
    
    const res = await fetch(
        "https://acity-backend.onrender.com/api/notifications",
        {
            headers:{
                Authorization: `Bearer ${token}`
            }
        }
    );
    
    allNotifications = await res.json();
    container.innerHTML = "";
    
    if(allNotifications.length === 0){
        container.innerHTML = `
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

function renderNotifications() {
    container.replaceChildren();

    const allowedTypes = new Set([
        "order",
        "message",
        "review",
        "accepted",
        "rejected"
    ]);

    const filtered =
        currentFilter === "all"
            ? allNotifications
            : allNotifications.filter(
                notification => notification.type === currentFilter
            );

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-bell-slash"></i>
                <h3>You're all caught up!</h3>
                <p>Nothing here yet.</p>
                <small>
                    Orders, messages, reviews and important updates
                    will appear here.
                </small>
            </div>
        `;
        return;
    }

    filtered.forEach(notification => {
        const type = allowedTypes.has(notification.type)
            ? notification.type
            : "default";

        const partnerId = Number.isFinite(
            Number(notification.conversation_user_id)
        )
            ? Number(notification.conversation_user_id)
            : null;

        const card = document.createElement("article");
        card.className =
            `notification-card ${notification.is_read ? "" : "unread"}`;

        card.addEventListener("click", () => {
            openNotification(
                Number(notification.id),
                type,
                partnerId,
                notification.title || "New Message"
            );
        });

        const icon = document.createElement("div");
        icon.className = `notification-icon icon-${type}`;
        icon.innerHTML = getNotificationIcon(type);

        const content = document.createElement("div");
        content.className = "notification-content";

        const top = document.createElement("div");
        top.className = "notification-top";

        const title = document.createElement("h3");
        title.textContent = notification.title || "Notification";

        const time = document.createElement("span");
        time.className = "notification-time";
        time.textContent = timeAgo(notification.created_at);

        top.append(title, time);

        const message = document.createElement("p");
        message.className = "notification-message";
        message.textContent = notification.message || "";

        const product = document.createElement("div");
        product.className = "notification-product";

        const productText = {
            order: "Marketplace Order",
            message: "New Conversation",
            review: "Review",
            accepted: "Accepted",
            rejected: "Rejected",
            default: "Notification"
        };

        product.innerHTML = getNotificationIcon(type);
        product.append(` ${productText[type]}`);

        content.append(top, message, product);

        const arrow = document.createElement("div");
        arrow.className = "notification-arrow";
        arrow.innerHTML =
            `<i class="fa-solid fa-chevron-right"></i>`;

        card.append(icon, content, arrow);

        if (!notification.is_read) {
            const dot = document.createElement("div");
            dot.className = "notification-dot";
            card.appendChild(dot);
        }

        container.appendChild(card);
    });
}

// Handler function that actually marks notifications read and handles redirects
async function openNotification(notificationId, type, partnerId, conversationName) {
    const token = localStorage.getItem("token");

    // 1. If it's a message, set the localStorage properties so messages.html can pick them up
    if (type === "message" && partnerId) {
        localStorage.setItem("openConversationWith", partnerId);
        localStorage.setItem("openConversationName", conversationName || "Chat");
    }

    // 2. Mark the notification as read on the backend database
    try {
        await fetch(`https://acity-backend.onrender.com/api/notifications/${notificationId}/read`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    } catch (err) {
        console.error("Failed to mark notification as read:", err);
    }

    // 3. Route user to correct page
    if (type === "message") {
        window.location.href = "messages.html"; // Ensure this matches your messages layout path
    } else if (type === "order" || type === "accepted" || type === "rejected") {
        window.location.href = "orders.html";
    } else {
        // Reload to update reading status indicator if no redirect is required
        loadNotifications();
    }
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
        showToast("Conversation not found.");
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
