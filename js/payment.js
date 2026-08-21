const API =
    "https://acity-backend.onrender.com/api";

const token =
    localStorage.getItem("token");

const paymentItems =
    document.getElementById("paymentItems");

const paymentTotal =
    document.getElementById("paymentTotal");

const deliverySummary =
    document.getElementById("deliverySummary");

const continueButton =
    document.getElementById(
        "continuePaymentBtn"
    );

const onlinePaymentNotice =
    document.getElementById(
        "onlinePaymentNotice"
    );

const pendingCheckout =
    JSON.parse(
        localStorage.getItem("pendingCheckout") ||
        "null"
    );
const paymentReference =
    new URLSearchParams(
        window.location.search
    ).get("reference");

async function verifyReturnedPayment() {
    if (!paymentReference) {
        return false;
    }

    try {
        const response = await fetch(
            `https://acity-backend.onrender.com/api/payments/verify?reference=${encodeURIComponent(paymentReference)}`,
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
                "Payment verification failed."
            );
        }

        localStorage.removeItem(
            "pendingCheckout"
        );

        localStorage.removeItem(
            "paystackReference"
        );

        window.location.href =
            "orders.html";

        return true;

    } catch (error) {
        console.error(
            "Payment verification error:",
            error
        );

        alert(
            error.message ||
            "Payment could not be verified."
        );

        return true;
    }
}
if (!token) {
    window.location.href = "login.html";
}

if (!pendingCheckout) {
    window.location.href = "myCart.html";
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatMoney(value) {
    return `GH₵${Number(value || 0).toFixed(2)}`;
}

function calculateTotal() {
    return pendingCheckout.items.reduce(
        (total, item) => {
            return total +
                Number(item.price || 0) *
                Number(item.quantity || 0);
        },
        0
    );
}

function renderItems() {
    paymentItems.innerHTML =
        pendingCheckout.items
            .map(item => `
                <div class="payment-item">
                    <img
                        src="${
                            escapeHtml(
                                item.image_url ||
                                "images/Other.jpg"
                            )
                        }"
                        alt="${escapeHtml(item.title)}"
                        onerror="
                            this.src='images/Other.jpg'
                        "
                    >

                    <div>
                        <h3>
                            ${escapeHtml(item.title)}
                        </h3>

                        <p>
                            Quantity:
                            ${escapeHtml(item.quantity)}
                        </p>
                    </div>

                    <strong>
                        ${formatMoney(
                            Number(item.price) *
                            Number(item.quantity)
                        )}
                    </strong>
                </div>
            `)
            .join("");

    paymentTotal.textContent =
        formatMoney(calculateTotal());
}

function renderDeliverySummary() {
    const method =
        pendingCheckout.delivery_method;

    if (method === "room") {
        deliverySummary.innerHTML = `
            <i class="fa-solid fa-building"></i>

            <span>
                <strong>Room delivery</strong>

                <small>
                    ${escapeHtml(
                        pendingCheckout.hostel ||
                        "Hostel not provided"
                    )}
                    · Room
                    ${escapeHtml(
                        pendingCheckout.room_number ||
                        "Not provided"
                    )}
                </small>
            </span>
        `;

        return;
    }

    const pickupLocation =
        pendingCheckout.meeting_location ||
        pendingCheckout.meeting_point ||
        "Pickup location not provided";

    deliverySummary.innerHTML = `
        <i class="fa-solid fa-location-dot"></i>

        <span>
            <strong>Pickup location</strong>

            <small>
                ${escapeHtml(pickupLocation)}
            </small>
        </span>
    `;
}

async function placeCashOrders() {
    const createdOrders = [];

    for (const item of pendingCheckout.items) {
        const response = await fetch(
            `${API}/listings/orders`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    listing_id: item.listing_id,
                    seller_id: item.seller_id,
                    quantity: item.quantity,
                    delivery_method:
                        pendingCheckout.delivery_method,
                    hostel:
                        pendingCheckout.hostel,
                    room_number:
                        pendingCheckout.room_number,
                    meeting_location:
                        pendingCheckout.meeting_location,
                    payment_method: "cash",
                    payment_status: "unpaid"
                })
            }
        );

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                data.error ||
                data.message ||
                "Could not place order."
            );
        }

        createdOrders.push(data.order);

        await fetch(
            `${API}/listings/cart/${item.listing_id}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
    }

    return createdOrders;
}

async function continuePayment() {
    const selectedMethod =
        document.querySelector(
            'input[name="paymentMethod"]:checked'
        )?.value;

    if (!selectedMethod) {
        alert("Select a payment method.");
        return;
    }

    continueButton.disabled = true;

    continueButton.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Processing...
    `;

    try {
        if (selectedMethod === "online") {
            const response = await fetch(
                "https://acity-backend.onrender.com/api/payments/initialize",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        items: pendingCheckout.items,
                        delivery: {
                            delivery_method:
                                pendingCheckout.delivery_method,
                            hostel:
                                pendingCheckout.hostel,
                            room_number:
                                pendingCheckout.room_number,
                            meeting_location:
                                pendingCheckout.meeting_location
                        }
                    })
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Could not initialize payment."
                );
            }

            localStorage.setItem(
                "paystackReference",
                data.reference
            );

            window.location.href =
                data.authorization_url;

            return;
        }

        await placeCashOrders();

        localStorage.removeItem(
            "pendingCheckout"
        );

        window.location.href =
            "orders.html";

    } catch (error) {
        console.error(
            "Payment error:",
            error
        );

        alert(
            error.message ||
            "Could not complete payment."
        );

        continueButton.disabled = false;

        continueButton.innerHTML = `
            <i class="fa-solid fa-lock"></i>
            Continue securely
        `;
    }
}

document
    .querySelectorAll(
        'input[name="paymentMethod"]'
    )
    .forEach(input => {
        input.addEventListener("change", () => {
            onlinePaymentNotice.classList.toggle(
                "hidden",
                input.value !== "online" ||
                !input.checked
            );

            continueButton.innerHTML =
                input.value === "online"
                    ? `
                        <i class="fa-solid fa-credit-card"></i>
                        Continue to online payment
                      `
                    : `
                        <i class="fa-solid fa-lock"></i>
                        Place order
                      `;
        });
    });

continueButton.addEventListener(
    "click",
    continuePayment
);

(async function initializePaymentPage() {
    const returnedFromPaystack =
        await verifyReturnedPayment();

    if (returnedFromPaystack) {
        return;
    }

    renderItems();
    renderDeliverySummary();
})();