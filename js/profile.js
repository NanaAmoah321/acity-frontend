
/* ==========================================
   PROFILE PAGE
   Acity Connect
========================================== */

const API = "https://acity-backend.onrender.com/api";

const token = localStorage.getItem("token");

if (!token) {
    window.location.replace("login.html");
    throw new Error("Authentication required");
}

const ItemsContainer =
    document.getElementById("ItemsContainer");

function getToken(){

    return localStorage.getItem("token");

}

let analyticsCharts = {};

const analyticsColors = [
    "#EF4444",
    "#F97316",
    "#EAB308",
    "#22C55E",
    "#3B82F6",
    "#8B5CF6",
    "#EC4899"
];

function updateDashboard(hasListings){

    document.getElementById("sellerDashboard")
        ?.classList.add("hidden");

    document.getElementById("buyerDashboard")
        ?.classList.add("hidden");

    document.getElementById("sellerActions")
        ?.classList.add("hidden");

    document.getElementById("buyerActions")
        ?.classList.add("hidden");

    document.getElementById("sellerInsights")
        ?.classList.add("hidden");

    document.getElementById("buyerInsights")
        ?.classList.add("hidden");

    if(hasListings){

        document.getElementById("sellerDashboard")
            ?.classList.remove("hidden");

        document.getElementById("sellerActions")
            ?.classList.remove("hidden");

        document.getElementById("sellerInsights")
            ?.classList.remove("hidden");

    }else{

        document.getElementById("buyerDashboard")
            ?.classList.remove("hidden");

        document.getElementById("buyerActions")
            ?.classList.remove("hidden");

        document.getElementById("buyerInsights")
            ?.classList.remove("hidden");

    }

}

function openEditProfile(){

    document
    .getElementById("editProfileModal")
    .classList.add("show")
    

}

function closeEditProfile(){

    document
    .getElementById("editProfileModal")
    .classList.remove("show")
    

}

async function loadProfile() {
    try {
        const res = await fetch(`${API}/auth/profile`, {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        });

        const user = await res.json();

        if (!res.ok) {
            showToast(
                user.error || "Unable to load profile",
                "error"
            );
            return;
        }

        updateHeroStats({
            listings: Number(user.listing_count || 0),
            rating: Number(user.average_rating || 0),
            orders: Number(user.order_count || 0),
            followers: Number(user.follower_count || 0),
            profile: user
        });

        localStorage.setItem("user", JSON.stringify(user));

        const profileName = document.getElementById("profileName");
        if (profileName) profileName.textContent = user.name;

        const profileEmail = document.getElementById("profileEmail");
        if (profileEmail) profileEmail.textContent = user.email;

        const profileImage = document.getElementById("profileImage");
        if (profileImage) {
            profileImage.src = 
                user.profile_picture || 
                "images/default-avatar-image.jpg";
            
            profileImage.onerror = () => {
                profileImage.src = "images/default-avatar-image.jpg";
            };
        }

        const profileBio = document.getElementById("profileBio");
        if (profileBio) {
            profileBio.textContent = user.bio || "Tell other students a little about yourself.";
        }

        const profileLevel = document.getElementById("profileLevel");
        if (profileLevel) {
            profileLevel.textContent = user.level ? `Level ${user.level}` : "Level Not Set";
        }

        const editName = document.getElementById("editName");
        if (editName) editName.value = user.name || "";

        const editLevel = document.getElementById("editLevel");
        if (editLevel) editLevel.value = user.level || "";

        const editBio = document.getElementById("editBio");
        if (editBio) editBio.value = user.bio || "";

        const mobileUser = document.getElementById("mobileUserName");
        if (mobileUser) mobileUser.textContent = user.name;

        if (user.verified) {
            document.getElementById("verifiedBadge")?.classList.remove("hidden");
        }

    } catch (err) {
        console.error("Load Profile Error:", err);
        showToast("Couldn't load profile.", "error");
    }
}

async function saveProfile(){

    try{

        const res = await fetch(

            `${API}/auth/profile`,

            {

                method:"PUT",

                headers:{

                    "Content-Type":

                    "application/json",

                    Authorization:

                    `Bearer ${getToken()}`

                },

                body:JSON.stringify({

                    name:

                    document.getElementById("editName").value,

                    level:

                    document.getElementById("editLevel").value,

                    bio:

                    document.getElementById("editBio").value

                })

            }

        );

        const data =
        await res.json();

        if(!res.ok){

            showToast(

                data.error ||

                "Update failed.",

                "error"

            );

            return;

        }

        showToast(

            "Profile updated successfully."

        );

        closeEditProfile();

        loadProfile();

    }

    catch(err){

        console.error(err);

    }

}

/* ==========================================
   DASHBOARD INITIALIZER
========================================== */

async function initializeDashboard(){

    try{

        const res = await fetch(

            `${API}/listings/my`,

            {

                headers:{

                    Authorization:

                    `Bearer ${getToken()}`

                }

            }

        );

        const listings = await res.json();

        if(!Array.isArray(listings)){

            console.error(listings);

            return;

        }

        const hasListings =
        listings.length > 0;

        updateDashboard(hasListings);

        updateRoleBadge(hasListings);

        loadListingStats(listings);

        if(hasListings){

            loadSellerOrders();

        }

    }

    catch(err){

        console.error(err);

    }

}

/* ==========================================
   ROLE BADGE
========================================== */

function updateRoleBadge(hasListings){

    const badge =
    document.getElementById("userRoleBadge");

    if(!badge) return;

    if(hasListings){

        badge.innerHTML = `

            <i class="fa-solid fa-store"></i>

            Student Seller

        `;

    }else{

        badge.innerHTML = `

            <i class="fa-solid fa-cart-shopping"></i>

            Active Buyer

        `;

    }

}

/* ==========================================
   DASHBOARD STATS
========================================== */

function loadListingStats(listings){

    document.getElementById("listingCount").textContent =
    listings.length;

    const sold =
    listings.filter(

        item =>

        item.status === "sold"

    ).length;

    document.getElementById("soldCount").textContent =
    sold;

}



/* ==========================================
   QUICK ACTIONS
========================================== */

function initializeQuickActions(){

    const sellerActions =
    document.getElementById("sellerActions");

    const buyerActions =
    document.getElementById("buyerActions");

    if(sellerActions){
        sellerActions.classList.add("fade-up");
    }

    if(buyerActions){
        buyerActions.classList.add("fade-up");
    }

}

function showSellerActions(){

    sellerActions?.classList.remove("hidden");
    buyerActions?.classList.add("hidden");

}

function showBuyerActions(){

    buyerActions?.classList.remove("hidden");
    sellerActions?.classList.add("hidden");

}

function safeImageUrl(value) {
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

async function loadMyItems() {

    const token = localStorage.getItem("token");

    if (!token) {

        showToast("Please login first");

        window.location.href = "login.html";

        return;

    }

    try {

        ItemsContainer.innerHTML = "";

        // Loading Skeleton

        for (let i = 0; i < 4; i++) {

            ItemsContainer.innerHTML += `
                <div class="profile-skeleton skeleton-card"></div>
            `;

        }

        const res = await fetch(

            "https://acity-backend.onrender.com/api/listings/my",

            {

                headers: {

                    Authorization: `Bearer ${token}`

                }

            }

        );

        const items = await res.json();

        

        if (!Array.isArray(items)) {

            console.error(items);

            ItemsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-circle-exclamation"></i>
                    <h3>Unable to load listings</h3>
                </div>
            `;

            return;

        }

        const hasListings = items.length > 0;

        // Seller / Buyer Mode
        updateDashboard(hasListings);

        updateRoleBadge(hasListings);

        // Dashboard Count
        const listingCountEl = document.getElementById("listingCount");
        if (listingCountEl) {
            listingCountEl.textContent = items.length;
        }

        const count = document.getElementById("itemsCount");

        if(count){

            count.textContent =
            items.length;

        }

        // Load stats cards values (such as sold item metrics)
        if (typeof loadListingStats === "function") {
            loadListingStats(items);
        }

        // Fetch seller orders if the user has active store items
        if (hasListings && typeof loadSellerOrders === "function") {
            loadSellerOrders();
        }

        ItemsContainer.innerHTML = "";

        // Empty State

        if(items.length === 0){

            ItemsContainer.innerHTML = `

                <div class="empty-state">

                    <i class="fa-solid fa-store-slash"></i>

                    <h3>No Listings Yet</h3>

                    <p>

                        Create your first listing and start selling across campus.

                    </p>

                    

                </div>

            `;

            return;

        }

        // Listing Cards

        items.slice(0, 6).forEach(item => {
            const card = document.createElement("div");

            card.className =
                "profile-card my-item-card fade-up";

            const listingCard = document.createElement("div");
            listingCard.className = "listing-card";

            const image = document.createElement("img");
            image.className = "listing-image";
            image.alt = item.title || "Listing image";
            image.src =
                safeImageUrl(item.image_url) ||
                "images/Other.jpg";

            image.onerror = () => {
                image.src = "images/Other.jpg";
            };

            const content = document.createElement("div");
            content.className = "listing-content";

            const top = document.createElement("div");
            top.className = "listing-top";

            const title = document.createElement("h3");
            title.textContent = item.title || "Untitled Listing";

            const status = document.createElement("span");
            status.className =
                `listing-status ${
                    item.status === "sold" ? "sold" : "active"
                }`;

            status.textContent =
                item.status === "sold" ? "Sold" : "Active";

            top.append(title, status);

            const price = document.createElement("div");
            price.className = "listing-price";

            const numericPrice = Number(item.price);

            price.textContent = Number.isFinite(numericPrice)
                ? `GH₵${numericPrice.toFixed(2)}`
                : "Price unavailable";

            const actions = document.createElement("div");
            actions.className = "listing-actions";

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.title = "Edit";
            editButton.innerHTML =
                `<i class="fa-solid fa-pen"></i>`;

            editButton.addEventListener("click", () => {
                editItem(item.id);
            });

            const soldButton = document.createElement("button");
            soldButton.type = "button";
            soldButton.title = "Mark Sold";
            soldButton.innerHTML =
                `<i class="fa-solid fa-check"></i>`;

            soldButton.addEventListener("click", () => {
                markSold(item.id);
            });

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.title = "Delete";
            deleteButton.innerHTML =
                `<i class="fa-solid fa-trash"></i>`;

            deleteButton.addEventListener("click", () => {
                deleteItem(item.id);
            });

            actions.append(
                editButton,
                soldButton,
                deleteButton
            );

            content.append(top, price, actions);
            listingCard.append(image, content);
            card.appendChild(listingCard);

            ItemsContainer.appendChild(card);
        });

    }

    catch(err){

        console.error(err);

        ItemsContainer.innerHTML = `

            <div class="empty-state">

                <i class="fa-solid fa-server"></i>

                <h3>Server Error</h3>

                <p>Please try again later.</p>

            </div>

        `;

    }

}

async function deleteItem(id){

    showConfirmModal({

        title:"Delete Listing",

        message:"This listing will be permanently deleted.",

        icon:"fa-trash",

        confirmText:"Delete",

        confirmClass:"btn-danger",

        onConfirm: async ()=>{

            const token = localStorage.getItem("token");

            const res = await fetch(
                `https://acity-backend.onrender.com/api/listings/${id}`,
                {
                    method:"DELETE",
                    headers:{
                        Authorization:`Bearer ${token}`
                    }
                }
            );

            const data = await res.json();

            if(res.ok){

                showToast("Listing deleted.");

                loadMyItems();

            }else{

                showToast(data.message || data.error);

            }

        }

    });

}
async function markSold(id){

    showConfirmModal({

        title:"Mark as Sold",

        message:"This listing will no longer be available for purchase.",

        icon:"fa-check",

        confirmText:"Mark Sold",

        confirmClass:"btn-success",

        onConfirm: async ()=>{

            const token = localStorage.getItem("token");

            const res = await fetch(
                `https://acity-backend.onrender.com/api/listings/${id}/sold`,
                {
                    method:"PUT",
                    headers:{
                        Authorization:`Bearer ${token}`
                    }
                }
            );

            const data = await res.json();

            if(res.ok){

                showToast("Listing marked as sold.");

                loadMyItems();

            }else{

                showToast(data.message || data.error);

            }

        }

    });

}
async function editItem(id) {
  const token = localStorage.getItem("token");
  const itemCard =
  Array.from(
    document.querySelectorAll(".profile-card")
  ).find(card =>
    card.innerHTML.includes(
      `editItem(${id})`
    )
  );
  const currentItem =
  (
    await fetch(
      `https://acity-backend.onrender.com/api/listings/${id}`
    )
  ).json();
  const item =
  await currentItem;
  const newTitle =
  prompt(
    "Enter new title:",
    item.title
  );
  const newDescription =
  prompt(
    "Enter new description:",
    item.description
  );
  const newCategory =
  prompt(
    "Enter category:",
    item.category
  );
  const newPrice =
  prompt(
    "Enter price:",
    item.price
  );
  const newImageUrl =
  prompt(
    "Enter image URL:",
    item.image_url
  );
  const newStatus =
  prompt(
    "Enter status:",
    item.status
  );
  const res =
  await fetch(
    `https://acity-backend.onrender.com/api/listings/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type":
        "application/json",
        "Authorization":
        `Bearer ${token}`
      },
      body: JSON.stringify({
        title:
        newTitle ||
        item.title,
        description:
        newDescription ||
        item.description,
        category:
        newCategory ||
        item.category,
        price:
        newPrice ||
        item.price,
        image_url:
        newImageUrl ||
        item.image_url,
        status:
        newStatus ||
        item.status
      })
    }
  );
  const data =
  await res.json();
  if (res.ok) {
    showToast(
      "Item updated!"
    );
    loadMyItems();
  } else {
    showToast(
      data.message ||
      data.error
    );
  }
}

async function loadSellerOrders() {
    const token = localStorage.getItem("token");
    const container = document.getElementById("ordersContainer");
    if (!container) return;

    container.innerHTML = `
        <div class="profile-skeleton order-skeleton"></div>
    `;

    try {
        const res = await fetch(
            "https://acity-backend.onrender.com/api/listings/seller-orders",
            {
                headers:{
                    Authorization:`Bearer ${token}`
                }
            }
        );

        const data = await res.json();
        const orders = data.orders || [];

        

        const countEl = document.getElementById("incomingOrdersCount");
        if (countEl) {
            countEl.textContent = orders.length;
        }

        container.innerHTML = "";

        if (orders.length === 0) {
            container.innerHTML = `
                <div class="emptyOrders">
                    <i class="fa-solid fa-box-open"></i>
                    <h3>No Incoming Orders</h3>
                    <p>
                        Orders from buyers will appear here.
                    </p>
                </div>
            `;
            return;
        }

        orders.forEach(order => {
            container.innerHTML += `
            <div class="incomingOrderCard">
                <div class="incomingOrderTop">
                    <div>
                        <h4>${order.title}</h4>
                        <small>
                            ${order.buyer_name}
                        </small>
                    </div>
                    <span class="orderPrice">
                        GH₵${order.price}
                    </span>
                </div>
                <div class="orderMeta">
                    <span>
                        <i class="fa-solid fa-location-dot"></i>
                        ${
                            order.delivery_method === "room"
                            ? `${order.hostel} • ${order.room_number}`
                            : order.meeting_location || "N/A"
                        }
                    </span>
                    <span>
                        <i class="fa-solid fa-clock"></i>
                        ${formatDate(order.created_at)}
                    </span>
                </div>
                <div class="incomingOrderButtons">
                    ${
                        order.status === "pending"
                        ? `
                        <button
                            class="btn btn-success"
                            onclick="acceptOrder(${order.id})"
                        >
                            Accept
                        </button>
                        <button
                            class="btn btn-danger"
                            onclick="rejectOrder(${order.id})"
                        >
                            Reject
                        </button>
                        `
                        : `<span class="statusBadge ${order.status.toLowerCase()}">
                            ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>`
                    }
                </div>
            </div>
            `;
        });
    } catch (err) {
        console.error(err);
        container.innerHTML = `
            <div class="emptyOrders">
                Server Error
            </div>
        `;
    }
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatServiceRequestDetails(details) {
    const labels = {
        pickup_location: "Pickup",
        dropoff_location: "Drop-off",
        preferred_date: "Date",
        preferred_time: "Time",
        item_size: "Item size",
        quantity: "Quantity",
        additional_details: "Notes",
        course: "Course",
        topic: "Topic",
        level: "Level",
        session_format: "Session format",
        project_type: "Project type",
        required_features: "Features",
        deadline: "Deadline",
        design_type: "Design type",
        dimensions: "Dimensions",
        event_type: "Event type",
        location: "Location",
        duration: "Duration",
        document_type: "Document type",
        word_count: "Word count",
        what_you_need: "Request",
        preferred_location: "Location",
        budget: "Budget"
    };

    if (!details || typeof details !== "object") {
        return "<span>No details provided.</span>";
    }

    return Object.entries(details)
        .filter(([, value]) => {
            return String(value || "").trim() !== "";
        })
        .map(([key, value]) => {
            const label =
                labels[key] ||
                key.replaceAll("_", " ");

            return `
                <span>
                    <strong>${escapeHtml(label)}:</strong>
                    ${escapeHtml(value)}
                </span>
            `;
        })
        .join("");
}

function openServiceRequestConversation(
    requesterId,
    requesterName
) {
    localStorage.removeItem("conversationListing");
    localStorage.removeItem("conversationService");

    localStorage.setItem(
        "openConversationWith",
        requesterId
    );

    localStorage.setItem(
        "openConversationName",
        requesterName
    );

    window.location.href = "inbox.html";
}

async function loadIncomingServiceRequests() {
    const token = localStorage.getItem("token");

    const container = document.getElementById(
        "serviceRequestsContainer"
    );

    if (!container || !token) {
        return;
    }

    container.innerHTML = `
        <div class="profile-skeleton order-skeleton"></div>
    `;

    try {
        const res = await fetch(
            "https://acity-backend.onrender.com/api/services/incoming",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const requests = await res.json();

        if (!res.ok) {
            throw new Error(
                requests.error ||
                "Could not load service requests."
            );
        }

        container.innerHTML = "";

        if (requests.length === 0) {
            container.innerHTML = `
                <div class="emptyOrders">
                    <i class="fa-solid fa-clipboard-list"></i>
                    <h3>No Incoming Requests</h3>
                    <p>
                        Service requests from students will appear here.
                    </p>
                </div>
            `;

            return;
        }

        requests.forEach(request => {
            const requestDetails =
                formatServiceRequestDetails(
                    request.request_details
                );

            const status =
                request.status.charAt(0).toUpperCase() +
                request.status.slice(1);

            container.innerHTML += `
                <div class="incomingOrderCard serviceRequestCard">
                    <div class="incomingOrderTop">
                        <div>
                            <h4>
                                ${escapeHtml(request.service_title)}
                            </h4>

                            <small>
                                ${escapeHtml(request.requester_name)}
                            </small>
                        </div>

                        <span class="statusBadge ${escapeHtml(request.status)}">
                            ${escapeHtml(status)}
                        </span>
                    </div>

                    <div class="orderMeta serviceRequestMeta">
                        ${requestDetails}
                    </div>

                    <div class="incomingOrderButtons">
                        ${
                            request.status === "pending"
                                ? `
                                    <button
                                        class="btn btn-success"
                                        onclick="updateServiceRequestStatus(
                                            ${Number(request.id)},
                                            'accepted'
                                        )"
                                    >
                                        Accept
                                    </button>

                                    <button
                                        class="btn btn-danger"
                                        onclick="updateServiceRequestStatus(
                                            ${Number(request.id)},
                                            'declined'
                                        )"
                                    >
                                        Decline
                                    </button>
                                `
                                : ""
                        }

                        <button
                            class="btn btn-secondary"
                            onclick="openServiceRequestConversation(
                                ${Number(request.requester_id)},
                                '${escapeHtml(request.requester_name)}'
                            )"
                        >
                            <i class="fa-solid fa-comments"></i>
                            Open conversation
                        </button>
                    </div>
                </div>
            `;
        });

    } catch (err) {
        console.error(err);

        container.innerHTML = `
            <div class="emptyOrders">
                Server Error
            </div>
        `;
    }
}

async function updateServiceRequestStatus(
    requestId,
    status
) {
    const isAccepting = status === "accepted";

    showConfirmModal({
        title: isAccepting
            ? "Accept Service Request"
            : "Decline Service Request",

        message: isAccepting
            ? "Accept this service request and notify the requester?"
            : "Decline this service request and notify the requester?",

        icon: isAccepting
            ? "fa-check"
            : "fa-xmark",

        confirmText: isAccepting
            ? "Accept"
            : "Decline",

        confirmClass: isAccepting
            ? "btn-success"
            : "btn-danger",

        onConfirm: async () => {
            try {
                const token =
                    localStorage.getItem("token");

                const res = await fetch(
                    `https://acity-backend.onrender.com/api/services/requests/${requestId}/status`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            status
                        })
                    }
                );

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(
                        data.error ||
                        "Could not update request."
                    );
                }

                showToast(data.message);

                loadIncomingServiceRequests();

            } catch (err) {
                console.error(err);

                showToast(
                    err.message ||
                    "Could not update request.",
                    "error"
                );
            }
        }
    });
}

async function acceptOrder(orderId){

    showConfirmModal({

        title:"Accept Order",

        message:"Accept this customer's order?",

        icon:"fa-check",

        confirmText:"Accept",

        confirmClass:"btn-success",

        onConfirm: async ()=>{

            const token = localStorage.getItem("token");

            const res = await fetch(
                `https://acity-backend.onrender.com/api/listings/orders/${orderId}`,
                {
                    method:"PUT",
                    headers:{
                        "Content-Type":"application/json",
                        Authorization:`Bearer ${token}`
                    },
                    body:JSON.stringify({
                        status:"accepted"
                    })
                }
            );

            const data = await res.json();

            showToast(data.message);

            loadSellerOrders();

            loadListings();

        }

    });

}
async function rejectOrder(orderId){

    showConfirmModal({

        title:"Reject Order",

        message:"Reject this customer's order?",

        icon:"fa-xmark",

        confirmText:"Reject",

        confirmClass:"btn-danger",

        onConfirm: async ()=>{

            const token = localStorage.getItem("token");

            const res = await fetch(
                `https://acity-backend.onrender.com/api/listings/orders/${orderId}`,
                {
                    method:"PUT",
                    headers:{
                        "Content-Type":"application/json",
                        Authorization:`Bearer ${token}`
                    },
                    body:JSON.stringify({
                        status:"rejected"
                    })
                }
            );

            const data = await res.json();

            showToast(data.message);

            loadSellerOrders();

            loadListings();

        }

    });

}

async function deleteProfile() {
    const button =
        document.getElementById("deleteAccountBtn");

    if (button) {
        button.disabled = true;
        button.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Deleting Account...
        `;
    }

    try {
        const response = await fetch(
            `${API}/auth/profile`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            }
        );

        const raw = await response.text();

        let data = {};

        try {
            data = raw ? JSON.parse(raw) : {};
        } catch {
            throw new Error(
                "The server returned an invalid response."
            );
        }

        if (!response.ok) {
            throw new Error(
                data.error ||
                data.message ||
                "Account deletion failed."
            );
        }

        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("openConversationWith");
        localStorage.removeItem("openConversationName");

        showToast(
            "Your account has been deleted."
        );

        setTimeout(() => {
            window.location.replace("login.html");
        }, 900);

    } catch (error) {
        console.error("Delete profile error:", error);

        showToast(
            error.message ||
            "Unable to delete your account.",
            "error"
        );

        if (button) {
            button.disabled = false;
            button.innerHTML = `
                <i class="fa-solid fa-trash"></i>
                Delete My Account
            `;
        }
    }
}

async function loadAnalytics() {
    const section =
        document.getElementById(
            "profileAnalytics"
        );

    if (!section) return;

    const range =
        document.getElementById(
            "analyticsRange"
        )?.value || "30";

    try {
        const response = await fetch(
            `${API}/analytics?range=${range}`,
            {
                headers: {
                    Authorization:
                        `Bearer ${getToken()}`
                }
            }
        );

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                data.error ||
                "Unable to load analytics."
            );
        }

        destroyAnalyticsCharts();

        const sellerHasActivity =
            data.seller.metrics.activeListings > 0 ||
            data.seller.metrics.orders > 0;

        document.getElementById(
            "profileAnalytics"
        ).classList.remove("hidden");

        document.getElementById(
            "sellerAnalytics"
        ).classList.toggle(
            "hidden",
            !sellerHasActivity
        );

        document.getElementById(
            "buyerAnalytics"
        ).classList.toggle(
            "hidden",
            sellerHasActivity
        );

        if (sellerHasActivity) {
            document.getElementById(
                "analyticsTitle"
            ).textContent =
                "Seller Analytics";

            document.getElementById(
                "analyticsSubtitle"
            ).textContent =
                "Understand your store performance and growth.";

            renderSellerAnalytics(data);
        } else {
            document.getElementById(
                "analyticsTitle"
            ).textContent =
                "Buyer Expense Tracker";

            document.getElementById(
                "analyticsSubtitle"
            ).textContent =
                "Track your spending and manage your budget.";

            renderBuyerAnalytics(data);
        }

    } catch (error) {
        console.error(
            "Analytics loading error:",
            error
        );
    }
}

async function saveBudget(event) {
    event.preventDefault();

    const input =
        document.getElementById(
            "budgetInput"
        );

    const monthly_budget =
        Number(input.value);

    if (
        !Number.isFinite(monthly_budget) ||
        monthly_budget < 0
    ) {
        showToast(
            "Enter a valid budget.",
            "error"
        );
        return;
    }

    try {
        const response = await fetch(
            `${API}/analytics/budget`,
            {
                method: "PUT",
                headers: {
                    "Content-Type":
                        "application/json",
                    Authorization:
                        `Bearer ${getToken()}`
                },
                body: JSON.stringify({
                    monthly_budget
                })
            }
        );

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                data.error ||
                "Unable to save budget."
            );
        }

        showToast(
            "Budget updated successfully."
        );

        await loadAnalytics();

    } catch (error) {
        showToast(
            error.message ||
            "Unable to save budget.",
            "error"
        );
    }
}

function messageSeller(userId, userName){

    localStorage.setItem(
        "openConversationWith",
        userId
    );

    localStorage.setItem(
        "openConversationName",
        userName
    );

    window.location.href =
    "inbox.html";

}

function formatDate(date) {
    return new Date(date).toLocaleString("en-GB",{
        day:"numeric",
        month:"short",
        hour:"2-digit",
        minute:"2-digit"
    });
}


function updateHeroStats({
    listings = 0,
    rating = 0,
    orders = 0,
    followers = 0,
    profile = {}
}){

    const listingsEl = document.getElementById("heroListings");
    if (listingsEl) listingsEl.textContent = listings;

    const ratingEl = document.getElementById("heroRating");
    if (ratingEl) ratingEl.textContent = Number(rating).toFixed(1);

    const ordersEl = document.getElementById("heroOrders");
    if (ordersEl) ordersEl.textContent = orders;

    const followersEl = document.getElementById("heroFollowers");
    if (followersEl) followersEl.textContent = followers;

    let completed = 0;

    if(profile.full_name) completed += 20;
    if(profile.profile_image) completed += 20;
    if(profile.bio) completed += 20;
    if(profile.email) completed += 20;
    if(listings > 0) completed += 20;

    const fill =
        document.getElementById("completionFill");

    const percent =
        document.getElementById("completionPercent");

    if(fill){

        fill.style.width = completed + "%";

    }

    if(percent){

        percent.textContent = completed + "%";

    }

}

function money(value) {
    return `GH₵${Number(value || 0).toFixed(2)}`;
}

function destroyAnalyticsCharts() {
    Object.values(analyticsCharts).forEach(chart => {
        if (chart) chart.destroy();
    });

    analyticsCharts = {};
}

function chartTheme() {
    const dark =
        document.body.classList.contains("dark");

    return {
        text: dark ? "#F8FAFC" : "#0F172A",
        muted: dark ? "#CBD5E1" : "#64748B",
        grid: dark
            ? "rgba(203, 213, 225, .12)"
            : "rgba(15, 23, 42, .10)"
    };
}

function baseChartOptions() {
    const theme = chartTheme();

    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: theme.text
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: theme.muted
                },
                grid: {
                    color: theme.grid
                }
            },
            y: {
                ticks: {
                    color: theme.muted
                },
                grid: {
                    color: theme.grid
                }
            }
        }
    };
}

function createLineChart(
    canvasId,
    labels,
    values,
    label
) {
    const canvas =
        document.getElementById(canvasId);

    if (!canvas) return;

    analyticsCharts[canvasId] =
        new Chart(canvas, {
            type: "line",
            data: {
                labels,
                datasets: [
                    {
                        label,
                        data: values,
                        borderColor: "#EF4444",
                        backgroundColor:
                            "rgba(239, 68, 68, .16)",
                        borderWidth: 3,
                        pointRadius: 3,
                        pointBackgroundColor: "#EF4444",
                        fill: true,
                        tension: .35
                    }
                ]
            },
            options: baseChartOptions()
        });
}

function createBarChart(
    canvasId,
    labels,
    values,
    label
) {
    const canvas =
        document.getElementById(canvasId);

    if (!canvas) return;

    analyticsCharts[canvasId] =
        new Chart(canvas, {
            type: "bar",
            data: {
                labels,
                datasets: [
                    {
                        label,
                        data: values,
                        backgroundColor: "#EF4444",
                        borderRadius: 8,
                        maxBarThickness: 34
                    }
                ]
            },
            options: baseChartOptions()
        });
}

function createDoughnutChart(
    canvasId,
    labels,
    values
) {
    const canvas =
        document.getElementById(canvasId);

    if (!canvas) return;

    const theme = chartTheme();

    analyticsCharts[canvasId] =
        new Chart(canvas, {
            type: "doughnut",
            data: {
                labels,
                datasets: [
                    {
                        data: values,
                        backgroundColor: analyticsColors,
                        borderColor: theme.text,
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            color: theme.text,
                            padding: 14
                        }
                    }
                }
            }
        });
}

function renderSellerAnalytics(data) {
    const seller = data.seller;
    const metrics = seller.metrics;

    document.getElementById(
        "sellerRevenue"
    ).textContent = money(metrics.revenue);

    document.getElementById(
        "sellerOrders"
    ).textContent = metrics.orders;

    document.getElementById(
        "sellerAverageOrder"
    ).textContent = money(
        metrics.averageOrderValue
    );

    document.getElementById(
        "sellerActiveListings"
    ).textContent = metrics.activeListings;

    document.getElementById(
        "sellerRating"
    ).textContent =
        `${Number(metrics.rating).toFixed(1)} rating`;

    document.getElementById(
        "sellerAudienceText"
    ).textContent =
        `Your store currently has ${metrics.followers} followers.`;

    if (metrics.orders > 0) {
        document.getElementById(
            "sellerInsightText"
        ).textContent =
            `You have generated ${money(metrics.revenue)} from ${metrics.orders} completed orders.`;
    }

    createLineChart(
        "sellerRevenueChart",
        seller.revenueTrend.labels,
        seller.revenueTrend.values,
        "Revenue"
    );

    createBarChart(
        "sellerOrdersChart",
        seller.ordersTrend.labels,
        seller.ordersTrend.values,
        "Orders"
    );

    createBarChart(
        "sellerListingsChart",
        seller.listingPerformance.map(
            item => item.title
        ),
        seller.listingPerformance.map(
            item => item.orders
        ),
        "Orders"
    );

    createDoughnutChart(
        "sellerCategoryChart",
        seller.categories.map(
            item => item.category
        ),
        seller.categories.map(
            item => item.value
        )
    );
}

function renderRecentPurchases(purchases) {
    const container =
        document.getElementById(
            "recentPurchases"
        );

    if (!container) return;

    container.innerHTML = "";

    if (!purchases.length) {
        container.innerHTML = `
            <div class="analyticsEmpty">
                No purchases yet.
            </div>
        `;
        return;
    }

    purchases.forEach(purchase => {
        const item =
            document.createElement("div");

        item.className =
            "recentPurchase";

        const date =
            new Date(
                purchase.createdAt
            ).toLocaleDateString(
                "en-GB",
                {
                    day: "numeric",
                    month: "short"
                }
            );

        item.innerHTML = `
            <div>
                <strong></strong>
                <small></small>
            </div>
            <span></span>
        `;

        item.querySelector(
            "strong"
        ).textContent = purchase.title;

        item.querySelector(
            "small"
        ).textContent =
            `${purchase.category || "Other"} · ${date}`;

        item.querySelector(
            "span"
        ).textContent = money(
            purchase.total
        );

        container.appendChild(item);
    });
}

function renderBuyerAnalytics(data) {
    const buyer = data.buyer;
    const metrics = buyer.metrics;

    document.getElementById(
        "buyerSpending"
    ).textContent = money(metrics.spending);

    document.getElementById(
        "buyerPeriodSpending"
    ).textContent = money(metrics.spending);

    document.getElementById(
        "buyerOrders"
    ).textContent = metrics.orders;

    document.getElementById(
        "buyerAveragePurchase"
    ).textContent = money(
        metrics.averagePurchase
    );

    const budget =
        Number(buyer.monthlyBudget || 0);

    const spent =
        Number(metrics.spending || 0);

    const remaining =
        Math.max(budget - spent, 0);

    const percentage =
        budget > 0
            ? Math.min((spent / budget) * 100, 100)
            : 0;

    document.getElementById(
        "buyerBudget"
    ).textContent = money(budget);

    document.getElementById(
        "buyerRemaining"
    ).textContent = money(remaining);

    document.getElementById(
        "buyerBudgetFill"
    ).style.width = `${percentage}%`;

    document.getElementById(
        "buyerBudgetPercent"
    ).textContent =
        budget > 0
            ? `${percentage.toFixed(0)}% of your budget used`
            : "Set a budget to track your progress.";

    document.getElementById(
        "budgetInput"
    ).value = budget || "";

    if (metrics.orders > 0) {
        document.getElementById(
            "buyerInsightText"
        ).textContent =
            `You have spent ${money(spent)} across ${metrics.orders} orders.`;
    }

    createLineChart(
        "buyerSpendingChart",
        buyer.spendingTrend.labels,
        buyer.spendingTrend.values,
        "Spending"
    );

    createDoughnutChart(
        "buyerCategoryChart",
        buyer.categories.map(
            item => item.category
        ),
        buyer.categories.map(
            item => item.value
        )
    );

    renderRecentPurchases(
        buyer.recentPurchases
    );
}

window.addEventListener(
    "focus",
    () => {
        loadAnalytics();
    }
);

document.addEventListener(
    "DOMContentLoaded",
    async () => {
        const editBtn =
            document.getElementById(
                "editProfileBtn"
            );

        if (editBtn) {
            editBtn.addEventListener(
                "click",
                openEditProfile
            );
        }

        const deleteAccountBtn =
            document.getElementById(
                "deleteAccountBtn"
            );

        if (deleteAccountBtn) {
            deleteAccountBtn.addEventListener(
                "click",
                () => {
                    showConfirmModal({
                        title: "Delete Account?",
                        message:
                            "This will permanently delete your profile and account data.",
                        icon: "fa-trash",
                        confirmText:
                            "Delete Account",
                        confirmClass:
                            "btn-danger",
                        onConfirm:
                            deleteProfile
                    });
                }
            );
        }

        const range =
            document.getElementById(
                "analyticsRange"
            );

        if (range) {
            range.addEventListener(
                "change",
                loadAnalytics
            );
        }

        const refresh =
            document.getElementById(
                "analyticsRefresh"
            );

        if (refresh) {
            refresh.addEventListener(
                "click",
                loadAnalytics
            );
        }

        const budgetForm =
            document.getElementById(
                "budgetForm"
            );

        if (budgetForm) {
            budgetForm.addEventListener(
                "submit",
                saveBudget
            );
        }

        await loadProfile();
        await initializeDashboard();
        await loadMyItems();
        await loadSellerOrders();
        await loadIncomingServiceRequests();
        await loadAnalytics();
    }
);