const ORDERS_API =
    "https://acity-backend.onrender.com/api/listings/orders";

const ordersContainer =
    document.getElementById("ordersContainer");

const refreshOrdersBtn =
    document.getElementById("refreshOrdersBtn");

const token =
    localStorage.getItem("token");

const requestedOrderId =
    new URLSearchParams(
        window.location.search
    ).get("id");
let orders = [];
let currentFilter = "active";
let loadingOrders = false;

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
        placed: "Order placed",
        preparing: "Preparing order",
        packaged: "Packaging order",
        ready: "Ready for pickup",
        out_for_delivery: "Out for delivery",
        completed: "Completed",
        cancelled: "Cancelled"
    };

    return labels[normalizeStatus(status)] ||
        "Order placed";
}

function isActiveOrder(order) {
    const status =
        normalizeStatus(order.status);

    return ![
        "completed",
        "cancelled"
    ].includes(status);
}

function getProgressSteps(order) {
    const status =
        normalizeStatus(order.status);

    const delivery =
        order.delivery_method === "delivery";

    const steps = [
        {
            key: "placed",
            label: "Placed"
        },
        {
            key: "preparing",
            label: "Preparing"
        },
        {
            key: "packaged",
            label: "Packaged"
        },
        {
            key: "ready",
            label: "Ready"
        }
    ];

    if (delivery) {
        steps.push({
            key: "out_for_delivery",
            label: "Out for delivery"
        });
    }

    steps.push({
        key: "completed",
        label: "Completed"
    });

    const statusOrder = [
        "placed",
        "preparing",
        "packaged",
        "ready",
        "out_for_delivery",
        "completed"
    ];

    const currentIndex =
        statusOrder.indexOf(status);

    return steps.map(step => {
        const stepIndex =
            statusOrder.indexOf(step.key);

        return {
            ...step,
            complete:
                status !== "cancelled" &&
                stepIndex <= currentIndex,
            current:
                status !== "cancelled" &&
                step.key === status
        };
    });
}

function renderTimeline(order) {
    const status =
        normalizeStatus(order.status);

    if (status === "cancelled") {
        return `
            <div class="order-cancelled-state">
                <i class="fa-solid fa-circle-xmark"></i>
                <span>This order was cancelled.</span>
            </div>
        `;
    }

    return `
        <div class="order-timeline">
            ${getProgressSteps(order)
                .map(step => `
                    <div class="
                        timeline-step
                        ${step.complete ? "complete" : ""}
                        ${step.current ? "current" : ""}
                    ">
                        <span class="timeline-dot">
                            ${
                                step.complete
                                    ? `<i class="fa-solid fa-check"></i>`
                                    : ""
                            }
                        </span>

                        <span class="timeline-label">
                            ${escapeHtml(step.label)}
                        </span>
                    </div>
                `)
                .join("")}
        </div>
    `;
}

function renderDeliveryDetails(order) {
    if (order.delivery_method === "room") {
        return `
            <span>
                <i class="fa-solid fa-building"></i>
                ${escapeHtml(order.hostel || "Hostel")}
                · Room ${escapeHtml(order.room_number || "N/A")}
            </span>
        `;
    }

    return `
        <span>
            <i class="fa-solid fa-location-dot"></i>
            ${escapeHtml(
                order.meeting_location ||
                "Pickup location not provided"
            )}
        </span>
    `;
}

function renderOrderCard(order) {
    const status =
        normalizeStatus(order.status);

    const seller =
        order.store_name ||
        order.seller_name ||
        "Student Store";

    const total =
        Number(order.price || 0) *
        Number(order.quantity || 1);

    const image =
        order.image_url ||
        "images/Other.jpg";

    return `
        <article
            class="buyer-order-card"
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
                                ${escapeHtml(seller)}
                            </p>
                        </div>

                        <span class="
                            order-status-badge
                            status-${escapeHtml(status)}
                        ">
                            ${escapeHtml(statusLabel(status))}
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
                            <i class="fa-solid fa-circle-check"></i>
                            Payment:
                            ${escapeHtml(
                                order.payment_status ||
                                "paid"
                            )}
                        </span>
                    </div>

                    ${renderTimeline(order)}

                    <div class="buyer-order-delivery">
                        ${renderDeliveryDetails(order)}
                    </div>

                    <div class="buyer-order-footer">
                        <span>
                            ${escapeHtml(statusLabel(status))}
                        </span>

                        <button
                            class="view-order-btn"
                            type="button"
                            data-order-id="${Number(order.id)}"
                        >
                            View details
                            <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        </article>
    `;
}

function renderEmptyState() {
    ordersContainer.innerHTML = `
        <div class="orders-empty">
            <i class="fa-solid fa-box-open"></i>
            <h2>No orders here yet</h2>
            <p>
                Orders placed through the marketplace
                will appear here.
            </p>

            <a href="marketplace.html">
                Browse marketplace
            </a>
        </div>
    `;
}

function renderLoading() {
    ordersContainer.innerHTML = `
        <div class="orders-loading">
            <i class="fa-solid fa-spinner fa-spin"></i>
            Loading orders...
        </div>
    `;
}

function getFilteredOrders() {
    if (currentFilter === "all") {
        return orders;
    }

    if (currentFilter === "active") {
        return orders.filter(isActiveOrder);
    }

    return orders.filter(order => {
        return normalizeStatus(order.status) ===
            currentFilter;
    });
}

function renderOrders() {
    const filteredOrders =
        getFilteredOrders();

    if (filteredOrders.length === 0) {
        renderEmptyState();
        return;
    }

    ordersContainer.innerHTML =
        filteredOrders
            .map(renderOrderCard)
            .join("");
}

async function loadOrders(showLoading = true) {
    if (loadingOrders) return;

    loadingOrders = true;

    if (showLoading) {
        renderLoading();
    }

    try {
        const response = await fetch(
            ORDERS_API,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "login.html";
            return;
        }

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                data.error ||
                "Could not load orders."
            );
        }

        orders =
            Array.isArray(data.orders)
                ? data.orders
                : [];

        renderOrders();

        if (requestedOrderId) {
            setTimeout(() => {
                openOrderDetails(requestedOrderId);
            }, 100);
        }

    } catch (error) {
        console.error(
            "Buyer orders error:",
            error
        );

        ordersContainer.innerHTML = `
            <div class="orders-error">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <h2>Could not load orders</h2>
                <p>
                    Please try again in a moment.
                </p>

                <button
                    id="retryOrdersBtn"
                    type="button"
                >
                    Try again
                </button>
            </div>
        `;

        document
            .getElementById("retryOrdersBtn")
            ?.addEventListener(
                "click",
                () => loadOrders(true)
            );

    } finally {
        loadingOrders = false;
    }
}

async function openOrderDetails(orderId) {
    try {
        const response = await fetch(
            `${ORDERS_API}/${encodeURIComponent(orderId)}`,
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
                "Could not load order details."
            );
        }

        const history =
            Array.isArray(data.history)
                ? data.history
                : [];

        const historyText =
            history.length > 0
                ? history.map(item => `
                    <li>
                        <strong>
                            ${escapeHtml(
                                statusLabel(item.status)
                            )}
                        </strong>
                        <span>
                            ${formatDate(item.created_at)}
                        </span>
                        ${
                            item.note
                                ? `<small>
                                    ${escapeHtml(item.note)}
                                   </small>`
                                : ""
                        }
                    </li>
                `).join("")
                : `
                    <li>
                        Order history is being prepared.
                    </li>
                `;

        const existingCard =
            document.querySelector(
                `[data-order-id="${orderId}"]`
            );

        if (!existingCard) return;

        let details =
            existingCard.querySelector(
                ".order-expanded-details"
            );

        if (!details) {
            details =
                document.createElement("div");

            details.className =
                "order-expanded-details";

            existingCard.appendChild(details);
        }

        details.innerHTML = `
            <div class="order-history">
                <h3>Order activity</h3>
                <ol>
                    ${historyText}
                </ol>
            </div>
        `;

        details.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });

    } catch (error) {
        console.error(
            "Order details error:",
            error
        );
    }
}

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

ordersContainer.addEventListener(
    "click",
    event => {
        const button =
            event.target.closest(".view-order-btn");

        if (!button) return;

        openOrderDetails(
            button.dataset.orderId
        );
    }
);

refreshOrdersBtn?.addEventListener(
    "click",
    () => loadOrders(true)
);

loadOrders(true);

setInterval(() => {
    loadOrders(false);
}, 15000);