const SELLER_ORDERS_API =
    "https://acity-backend.onrender.com/api/listings/seller-orders";

const UPDATE_ORDER_API =
    "https://acity-backend.onrender.com/api/listings/orders";

const token =
    localStorage.getItem("token");

const container =
    document.getElementById(
        "incomingOrdersContainer"
    );

const refreshButton =
    document.getElementById(
        "refreshIncomingBtn"
    );
const requestedOrderId =
    new URLSearchParams(
        window.location.search
    ).get("id");
let incomingOrders = [];
let currentFilter = "active";
let loading = false;

if (!token) {
    window.location.href = "login.html";
}

const escapeHtml = value =>
    String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

function formatMoney(value) {
    const amount = Number(value);

    return Number.isFinite(amount)
        ? `GH₵${amount.toFixed(2)}`
        : "GH₵0.00";
}

function formatDate(value) {
    if (!value) return "Date unavailable";

    return new Date(value).toLocaleString(
        "en-GH",
        {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}

function normalizeStatus(status) {
    const aliases = {
        pending: "placed",
        accepted: "preparing",
        rejected: "cancelled"
    };

    return aliases[status] || status || "placed";
}

function statusLabel(status) {
    const labels = {
        placed: "New order",
        preparing: "Preparing",
        packaged: "Packaged",
        ready: "Ready",
        out_for_delivery: "Out for delivery",
        completed: "Completed",
        cancelled: "Cancelled"
    };

    return labels[normalizeStatus(status)] ||
        "Order";
}

function isActive(order) {
    return ![
        "completed",
        "cancelled"
    ].includes(
        normalizeStatus(order.status)
    );
}

function getNextAction(order) {
    const status =
        normalizeStatus(order.status);

    if (status === "placed") {
        return {
            status: "preparing",
            label: "Start preparing",
            icon: "fa-fire"
        };
    }

    if (status === "preparing") {
        return {
            status: "packaged",
            label: "Mark packaged",
            icon: "fa-box"
        };
    }

    if (status === "packaged") {
        return {
            status: "ready",
            label: "Mark ready",
            icon: "fa-circle-check"
        };
    }

    if (
        status === "ready" &&
        order.delivery_method === "delivery"
    ) {
        return {
            status: "out_for_delivery",
            label: "Send for delivery",
            icon: "fa-truck"
        };
    }

    if (
        status === "ready" &&
        order.delivery_method !== "delivery"
    ) {
        return {
            status: "completed",
            label: "Complete pickup",
            icon: "fa-check"
        };
    }

    if (status === "out_for_delivery") {
        return {
            status: "completed",
            label: "Mark delivered",
            icon: "fa-check"
        };
    }

    return null;
}

function renderOrderCard(order) {
    const status =
        normalizeStatus(order.status);

    const action =
        getNextAction(order);

    const buyer =
        order.buyer_name ||
        "Student buyer";

    const total =
        Number(order.price || 0) *
        Number(order.quantity || 1);

    const image =
        order.image_url ||
        "images/Other.jpg";

    const isFinished =
        ["completed", "cancelled"]
            .includes(status);

    return `
        <article
            class="buyer-order-card seller-order-card"
            data-order-id="${Number(order.id)}"
        >
            <div class="buyer-order-top">
                <span class="order-number">
                    Order #${escapeHtml(order.id)}
                </span>

                <span class="order-date">
                    ${formatDate(order.created_at)}
                </span>
            </div>

            <div class="buyer-order-main">

                <div class="buyer-order-image">
                    <img
                        src="${escapeHtml(image)}"
                        alt="${escapeHtml(order.title)}"
                        onerror="this.src='images/Other.jpg'"
                    >
                </div>

                <div class="buyer-order-content">

                    <div class="buyer-order-heading">
                        <div>
                            <h2>
                                ${escapeHtml(
                                    order.title ||
                                    "Marketplace item"
                                )}
                            </h2>

                            <p>
                                Buyer:
                                ${escapeHtml(buyer)}
                            </p>
                        </div>

                        <span class="
                            order-status-badge
                            status-${escapeHtml(status)}
                        ">
                            ${escapeHtml(
                                statusLabel(status)
                            )}
                        </span>
                    </div>

                    <div class="buyer-order-meta">
                        <span>
                            <i class="fa-solid fa-box"></i>
                            Quantity:
                            ${escapeHtml(order.quantity || 1)}
                        </span>

                        <span>
                            <i class="fa-solid fa-money-bill"></i>
                            ${formatMoney(total)}
                        </span>

                        <span>
                            <i class="fa-solid fa-credit-card"></i>
                            Payment:
                            ${escapeHtml(
                                order.payment_status ||
                                "paid"
                            )}
                        </span>
                    </div>

                    <div class="buyer-order-delivery">
                        ${
                            order.delivery_method === "room"
                                ? `
                                    <span>
                                        <i class="fa-solid fa-building"></i>
                                        ${escapeHtml(
                                            order.hostel ||
                                            "Hostel"
                                        )}
                                        · Room
                                        ${escapeHtml(
                                            order.room_number ||
                                            "N/A"
                                        )}
                                    </span>
                                `
                                : `
                                    <span>
                                        <i class="fa-solid fa-location-dot"></i>
                                        ${escapeHtml(
                                            order.meeting_location ||
                                            "Pickup location not provided"
                                        )}
                                    </span>
                                `
                        }

                        <span>
                            <i class="fa-solid fa-clock"></i>
                            ${formatDate(order.created_at)}
                        </span>
                    </div>

                    <div class="seller-order-actions">
                        ${
                            action
                                ? `
                                    <button
                                        class="seller-status-btn"
                                        data-order-id="${Number(order.id)}"
                                        data-next-status="${action.status}"
                                        type="button"
                                    >
                                        <i class="fa-solid ${action.icon}"></i>
                                        ${action.label}
                                    </button>
                                `
                                : ""
                        }

                        ${
                            !isFinished
                                ? `
                                    <button
                                        class="seller-cancel-btn"
                                        data-order-id="${Number(order.id)}"
                                        type="button"
                                    >
                                        <i class="fa-solid fa-xmark"></i>
                                        Cancel order
                                    </button>
                                `
                                : ""
                        }
                    </div>

                </div>
            </div>
        </article>
    `;
}

function renderEmptyState() {
    container.innerHTML = `
        <div class="orders-empty">
            <i class="fa-solid fa-box-open"></i>
            <h2>No incoming orders</h2>
            <p>
                New buyer orders will appear here.
            </p>
        </div>
    `;
}

function getFilteredOrders() {
    if (currentFilter === "all") {
        return incomingOrders;
    }

    if (currentFilter === "active") {
        return incomingOrders.filter(isActive);
    }

    return incomingOrders.filter(order => {
        return normalizeStatus(order.status) ===
            currentFilter;
    });
}

function renderOrders() {
    const filtered =
        getFilteredOrders();

    if (filtered.length === 0) {
        renderEmptyState();
        return;
    }

    container.innerHTML =
        filtered
            .map(renderOrderCard)
            .join("");
}

async function loadIncomingOrders(
    showLoading = true
) {
    if (loading) return;

    loading = true;

    if (showLoading) {
        container.innerHTML = `
            <div class="orders-loading">
                <i class="fa-solid fa-spinner fa-spin"></i>
                Loading incoming orders...
            </div>
        `;
    }

    try {
        const response = await fetch(
            SELLER_ORDERS_API,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                data.error ||
                data.message ||
                "Could not load incoming orders."
            );
        }

        incomingOrders =
            Array.isArray(data.orders)
                ? data.orders
                : [];

        renderOrders();

        if (requestedOrderId) {
            const targetCard =
                document.querySelector(
                    `[data-order-id="${requestedOrderId}"]`
                );

            targetCard?.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }

    } catch (error) {
        console.error(
            "Incoming orders error:",
            error
        );

        if (showLoading) {
            container.innerHTML = `
                <div class="orders-error">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <h2>Could not load orders</h2>
                    <p>
                        Please try again later.
                    </p>
                </div>
            `;
        }

    } finally {
        loading = false;
    }
}

async function updateOrderStatus(
    orderId,
    status
) {
    try {
        const response = await fetch(
            `${UPDATE_ORDER_API}/${encodeURIComponent(orderId)}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    status
                })
            }
        );

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                data.error ||
                "Could not update order."
            );
        }

        await loadIncomingOrders(false);

    } catch (error) {
        console.error(
            "Order status update error:",
            error
        );

        alert(
            error.message ||
            "Could not update order."
        );
    }
}

container.addEventListener(
    "click",
    event => {
        const statusButton =
            event.target.closest(
                ".seller-status-btn"
            );

        if (statusButton) {
            updateOrderStatus(
                statusButton.dataset.orderId,
                statusButton.dataset.nextStatus
            );

            return;
        }

        const cancelButton =
            event.target.closest(
                ".seller-cancel-btn"
            );

        if (cancelButton) {
            const confirmed =
                window.confirm(
                    "Cancel this order?"
                );

            if (confirmed) {
                updateOrderStatus(
                    cancelButton.dataset.orderId,
                    "cancelled"
                );
            }
        }
    }
);

document
    .querySelectorAll(".order-tab")
    .forEach(tab => {
        tab.addEventListener("click", () => {
            document
                .querySelectorAll(".order-tab")
                .forEach(item => {
                    item.classList.remove("active");
                });

            tab.classList.add("active");

            currentFilter =
                tab.dataset.filter || "active";

            renderOrders();
        });
    });

refreshButton?.addEventListener(
    "click",
    () => loadIncomingOrders(true)
);

loadIncomingOrders(true);

setInterval(() => {
    loadIncomingOrders(false);
}, 15000);