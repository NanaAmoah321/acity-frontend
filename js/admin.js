const token =
localStorage.getItem("token");

async function loadDashboard() {

    const res = await fetch(
        "http://localhost:5000/api/admin/stats",
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
        "http://localhost:5000/api/admin/listings",
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
        "recentListings"
    );

    container.innerHTML = "";

    listings.forEach(item => {

        const card =
        document.createElement("div");

        card.classList.add("card");

        card.innerHTML = `
            <h3>${item.title}</h3>

            <p>
                ${item.seller_name}
            </p>

            <button
                onclick="
                deleteListing(
                ${item.id}
                )"
            >
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
        `http://localhost:5000/api/admin/listings/${id}`,
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
        "http://localhost:5000/api/admin/services",
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
        "recentServices"
    );

    container.innerHTML = "";

    services.forEach(service => {

        const card =
        document.createElement("div");

        card.classList.add("card");

        card.innerHTML = `
            <h3>${service.title}</h3>

            <p>
                ${service.provider_name}
            </p>

            <button
                onclick="
                deleteService(
                ${service.id}
                )"
            >
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
        `http://localhost:5000/api/admin/services/${id}`,
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
        "http://localhost:5000/api/admin/users",
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
        "usersContainer"
    );

    container.innerHTML = "";

    users.forEach(user => {

        const card =
        document.createElement("div");

        card.classList.add("card");

        card.innerHTML = `
            <h3>${user.name}</h3>

            <p>${user.email}</p>

            <p>
                Role:
                ${user.role}
            </p>

            <button
                onclick="
                makeAdmin(
                ${user.id}
                )"
            >
                Make Admin
            </button>

            <button
                onclick="
                suspendUser(
                ${user.id}
                )"
            >
                Suspend
            </button>

            <button
                onclick="
                deleteUser(
                ${user.id}
                )"
            >
                Delete
            </button>
        `;

        container.appendChild(card);

    });

}

async function makeAdmin(id) {

    await fetch(
        `http://localhost:5000/api/admin/users/${id}/admin`,
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
        `http://localhost:5000/api/admin/users/${id}/suspend`,
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
        `http://localhost:5000/api/admin/users/${id}`,
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