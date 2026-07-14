
/* ==========================================
   PROFILE PAGE
   Acity Connect
========================================== */

const API = "https://acity-backend.onrender.com/api";

function getToken(){

    return localStorage.getItem("token");

}


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

async function loadProfile(){

    try{

        const res = await fetch(

            `${API}/auth/profile`,

            {

                headers:{

                    Authorization:
                    `Bearer ${getToken()}`

                }

            }

        );

        const user = await res.json();

        updateHeroStats({
            listings: user.items?.length || 0,
            rating: user.rating || 0,
            orders: user.orders || 0,
            followers: user.followers || 0,
            profile: user
        });

        if(!res.ok){

            showToast(

                user.error ||

                "Unable to load profile",

                "error"

            );

            return;

        }

        localStorage.setItem(

            "user",

            JSON.stringify(user)

        );

        document.getElementById("profileName").textContent =
        user.name;

        document.getElementById("profileEmail").textContent =
        user.email;

        document.getElementById("profileBio").textContent =
        user.bio ||
        "Tell other students a little about yourself.";

        document.getElementById("profileLevel").textContent =
        user.level
        ?
        `Level ${user.level}`
        :
        "Level Not Set";

        document.getElementById("editName").value =
        user.name || "";

        document.getElementById("editLevel").value =
        user.level || "";

        document.getElementById("editBio").value =
        user.bio || "";

        const mobileUser =
        document.getElementById("mobileUserName");

        if(mobileUser){

            mobileUser.textContent =
            user.name;

        }

        if(user.verified){

            document
            .getElementById("verifiedBadge")
            ?.classList.remove("hidden");

        }

    }

    catch(err){

        console.error(err);

        showToast(

            "Couldn't load profile.",

            "error"

        );

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

                    <a
                        href="create-listing.html"
                        class="btn btn-primary"
                    >

                        <i class="fa-solid fa-plus"></i>

                        Create Listing

                    </a>

                </div>

            `;

            return;

        }

        // Listing Cards

        items
        .slice(0,6)
        .forEach(item=>{

            const statusClass =

                item.status === "sold"

                ? "sold"

                : "active";

            const card = document.createElement("div");

            // Added 'profile-card' back to ensure editItem's querySelector works properly
            card.className = "profile-card my-item-card fade-up";

            card.innerHTML = `

                <div class="listing-card">

                    <img

                        src="${item.image_url || `images/${item.category}.jpg`}"

                        class="listing-image"

                        onerror="this.src='images/Other.jpg'"

                    >

                    <div class="listing-content">

                        <div class="listing-top">

                            <h3>${item.title}</h3>

                            <span class="listing-status ${statusClass}">

                                ${item.status}

                            </span>

                        </div>

                        <div class="listing-price">

                            GH₵${item.price}

                        </div>

                        <div class="listing-actions">

                            <button
                                onclick="editItem(${item.id})"
                                title="Edit"
                            >

                                <i class="fa-solid fa-pen"></i>

                            </button>

                            <button
                                onclick="markSold(${item.id})"
                                title="Mark Sold"
                            >

                                <i class="fa-solid fa-check"></i>

                            </button>

                            <button
                                onclick="deleteItem(${item.id})"
                                title="Delete"
                            >

                                <i class="fa-solid fa-trash"></i>

                            </button>

                        </div>

                    </div>

                </div>

            `;

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

document.addEventListener(

    "DOMContentLoaded",

    async()=>{

        const editBtn =
        document.getElementById("editProfileBtn");

        if(editBtn){

            editBtn.addEventListener(

                "click",

                openEditProfile

            );

        }

        await loadProfile();

        await initializeDashboard();

        await loadMyItems();

        await loadSellerOrders();

        

    }

);