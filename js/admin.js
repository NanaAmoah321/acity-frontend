const token =
localStorage.getItem("token");
const user =
JSON.parse(
    localStorage.getItem("user")
);
if (
    !user ||
    user.role !== "admin"
) {
    window.location.href =
    "marketplace.html";
}
async function loadDashboard() {
    const res = await fetch(
        "https://acity-backend.onrender.com/api/admin/stats",
        {
            headers: {
                Authorization:
                `Bearer ${token}`
            }
        }
    );
    const data = await res.json();
    document.getElementById(
        "usersCount"
    ).innerText = data.users;
    document.getElementById(
        "listingsCount"
    ).innerText = data.listings;
    document.getElementById(
        "servicesCount"
    ).innerText = data.services;
    document.getElementById(
        "messagesCount"
    ).innerText = data.messages;
}
loadDashboard();
async function loadListings() {
    const res = await fetch(
        "https://acity-backend.onrender.com/api/admin/listings",
        {
            headers: {
                Authorization:
                `Bearer ${token}`
            }
        }
    );
    const listings =
    await res.json();
    const container =
    document.getElementById(
        "adminRecentListings"
    );
    container.innerHTML = "";
    listings.forEach(item => {
        const card =
        document.createElement("div");
        card.classList.add("admin-listing-card");
        card.innerHTML = `
            <h3>${item.title}</h3>
            <p>
                ${item.seller_name}
            </p>
            <button
                class="btn-delete"
                onclick="deleteListing(${item.id})"
            >
                <i class="fa-solid fa-trash"></i>
                Delete
            </button>
        `;
        container.appendChild(
            card
        );
    });
}
loadListings();
async function deleteListing(id) {
    if (
        !confirm(
            "Delete listing?"
        )
    ) {
        return;
    }
    await fetch(
        `https://acity-backend.onrender.com/api/admin/listings/${id}`,
        {
            method: "DELETE",
            headers: {
                Authorization:
                `Bearer ${token}`
            }
        }
    );
    loadListings();
}
async function loadServices() {
    const res = await fetch(
        "https://acity-backend.onrender.com/api/admin/services",
        {
            headers: {
                Authorization:
                `Bearer ${token}`
            }
        }
    );
    const services = await res.json();
    const container =
    document.getElementById(
        "adminRecentServices"
    );
    container.innerHTML = "";
    services.forEach(service => {
        const card =
        document.createElement("div");
        card.classList.add("admin-service-card");
        card.innerHTML = `
            <h3>${service.title}</h3>
            <p>
                ${service.provider_name}
            </p>
            <button
                class="btn-delete"
                onclick="deleteService(${service.id})"
            >
                <i class="fa-solid fa-trash"></i>
                Delete
            </button>
        `;
        container.appendChild(card);
    });
}
async function deleteService(id) {
    if (
        !confirm(
            "Delete service?"
        )
    ) {
        return;
    }
    await fetch(
        `https://acity-backend.onrender.com/api/admin/services/${id}`,
        {
            method: "DELETE",
            headers: {
                Authorization:
                `Bearer ${token}`
            }
        }
    );
    loadServices();
}
async function loadUsers() {
    const res = await fetch(
        "https://acity-backend.onrender.com/api/admin/users",
        {
            headers: {
                Authorization:
                `Bearer ${token}`
            }
        }
    );
    const users =
    await res.json();
    const container =
    document.getElementById(
        "adminUsersContainer"
    );
    container.innerHTML = "";
    users.forEach(user => {
        const card =
        document.createElement("div");
        card.classList.add("admin-user-card");
        card.innerHTML = `
            <h3>${user.name}</h3>
            <p>${user.email}</p>
            <p>
                Role:
                ${user.role}
            </p>
           <div class="admin-actions">
                <button
                    class="btn-admin"
                    onclick="makeAdmin(${user.id})"
                >
                    Promote
                </button>
                <button
                    class="btn-suspend"
                    onclick="suspendUser(${user.id})"
                >
                    Suspend
                </button>
                <button
                    class="btn-delete"
                    onclick="deleteUser(${user.id})"
                >
                    Delete
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}
async function makeAdmin(id) {
    await fetch(
        `https://acity-backend.onrender.com/api/admin/users/${id}/admin`,
        {
            method: "PUT",
            headers: {
                Authorization:
                `Bearer ${token}`
            }
        }
    );
    loadUsers();
}
async function suspendUser(id) {
    await fetch(
        `https://acity-backend.onrender.com/api/admin/users/${id}/suspend`,
        {
            method: "PUT",
            headers: {
                Authorization:
                `Bearer ${token}`
            }
        }
    );
    loadUsers();
}
async function deleteUser(id) {
    if (!confirm("Delete user?"))
        return;
    await fetch(
        `https://acity-backend.onrender.com/api/admin/users/${id}`,
        {
            method: "DELETE",
            headers: {
                Authorization:
                `Bearer ${token}`
            }
        }
    );
    loadUsers();
}
loadDashboard();
loadListings();
loadServices();
loadUsers();