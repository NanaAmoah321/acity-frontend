const token = localStorage.getItem("token");

if (!token) {
    window.location.replace("login.html");
    throw new Error("Authentication required");
}
let notificationsRequestInFlight = false;

let allNotifications = [];
let currentFilter = "all";
const container = document.getElementById("notificationsContainer");

async function loadNotifications(showLoading = true) {
    if (!container) return;

    if (notificationsRequestInFlight) {
        return;
    }

    notificationsRequestInFlight = true;

    if (showLoading) {
        container.innerHTML = Array(5)
            .fill(
                '<div class="notification-skeleton skeleton-card"></div>'
            )
            .join("");
    }

    try {
        const res = await fetch(
            "https://acity-backend.onrender.com/api/notifications",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (res.status === 401) {
            handleLogout();
            return;
        }

        if (!res.ok) {
            throw new Error(
                "Could not load notifications."
            );
        }

        const data = await res.json();

        if (!Array.isArray(data)) {
            throw new Error(
                "Invalid notifications response."
            );
        }

        allNotifications = data;
        renderNotifications();

        if (window.updateNotificationCount) {
            window.updateNotificationCount();
        }

    } catch (err) {
        console.error(
            "Load Notifications Error:",
            err
        );

        // Do not destroy already-loaded notifications
        // during a background refresh.
        if (showLoading) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <h3>Error Loading Notifications</h3>
                    <p>
                        Please refresh the page or try again later.
                    </p>
                </div>
            `;
        }

    } finally {
        notificationsRequestInFlight = false;
    }
}

function getNotificationIcon(type) {
    switch (type) {
        case "order": return `<i class="fa-solid fa-box"></i>`;
        case "message": return `<i class="fa-solid fa-comments"></i>`;
        case "review": return `<i class="fa-solid fa-star"></i>`;
        case "service": return `<i class="fa-solid fa-screwdriver-wrench"></i>`;
        case "accepted": return `<i class="fa-solid fa-circle-check"></i>`;
        case "rejected": return `<i class="fa-solid fa-circle-xmark"></i>`;
        default: return `<i class="fa-solid fa-bell"></i>`;
    }
}

function timeAgo(date) {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
}

function renderNotifications() {
    if (!container) return;
    container.replaceChildren();

    const allowedTypes = new Set(["order", "message", "review", "accepted", "rejected"]);

    const filtered = currentFilter === "all"
    ? allNotifications
    : allNotifications.filter(notification => {
        const type = String(
            notification.type || ""
        ).toLowerCase();

        return type === currentFilter;
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-bell-slash"></i>
                <h3>You're all caught up!</h3>
                <p>Nothing here yet.</p>
                <small>Orders, messages, reviews, and important updates will appear here.</small>
            </div>
        `;
        return;
    }

    filtered.forEach(notification => {
        const normalizedType = String(
            notification.type || ""
        ).toLowerCase();

        const type = allowedTypes.has(normalizedType)
            ? normalizedType
            : "default";
        const partnerId = Number.isFinite(Number(notification.conversation_user_id))
            ? Number(notification.conversation_user_id)
            : null;

        const card = document.createElement("article");
        card.className = `notification-card ${notification.is_read ? "" : "unread"}`;

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
        arrow.innerHTML = `<i class="fa-solid fa-chevron-right"></i>`;

        card.append(icon, content, arrow);

        if (!notification.is_read) {
            const dot = document.createElement("div");
            dot.className = "notification-dot";
            card.appendChild(dot);
        }

        container.appendChild(card);
    });
}

async function openNotification(notificationId, type, conversationUserId, conversationName) {
    try {
        const res = await fetch(
            `https://acity-backend.onrender.com/api/notifications/${notificationId}/read`,
            {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!res.ok) {
            throw new Error(await res.text());
        }

        const target = allNotifications.find(n => Number(n.id) === Number(notificationId));
        if (target) target.is_read = true;

        renderNotifications();

        if (window.updateNotificationCount) {
            window.updateNotificationCount();
        }

        await loadNotifications();

        // Navigation
        if (type === "message") {
            localStorage.setItem("openConversationWith", conversationUserId);
            localStorage.setItem("openConversationName", conversationName || "Chat");
            window.location.href = "inbox.html";
            return;
        }

        if (["order", "accepted", "rejected"].includes(type)) {
            window.location.href = "profile.html";
            return;
        }

    } catch (err) {
        console.error(err);
    }
}

// "Mark All as Read" function
async function markAllAsRead() {
    try {
        const res = await fetch(
            "https://acity-backend.onrender.com/api/notifications/read-all",
            {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!res.ok) {
            throw new Error(await res.text());
        }

        allNotifications.forEach(n => n.is_read = true);

        renderNotifications();

        if (window.updateNotificationCount) {
            window.updateNotificationCount();
        }

        await loadNotifications();

    } catch (err) {
        console.error(err);
    }
}

function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.replace("login.html");
}

document.querySelectorAll(".notification-filter").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".notification-filter")
            .forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");

        currentFilter = button.dataset.filter;

        renderNotifications();
    });
});

// Attach event listener for "Mark All As Read" button if present
document.getElementById("markAllReadBtn")?.addEventListener("click", markAllAsRead);

// Initial Load
// Initial load
loadNotifications(true);

// Refresh notifications and the navbar counter.
setInterval(() => {
    loadNotifications(false);
}, 15000);