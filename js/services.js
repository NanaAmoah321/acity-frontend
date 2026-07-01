const ServicesContainer =
document.getElementById("servicesContainer");

const searchService =
document.getElementById("searchService");

let selectedCategory = "All";
document
.querySelectorAll(".categories button")
.forEach(button => {

    button.addEventListener("click", () => {

        selectedCategory =
        button.dataset.category;

        displayServices();

    });

});

//const categoryFilter =
//document.getElementById("categoryFilter");

let services = [];

async function loadServices() {

    try {

        const res = await fetch(
            "https://acity-backend.onrender.com/api/services"
        );

        services = await res.json();

        displayServices();

    } catch (err) {

        console.error(err);

    }

}

function displayServices() {

    const searchText =
    searchService.value.toLowerCase();

    
    

    ServicesContainer.innerHTML = "";

    if (services.length === 0) {

    ServicesContainer.innerHTML = `
    <div class="empty-state">

    <i class="fa-solid fa-screwdriver-wrench"></i>

    <h3>No Services Found</h3>

    <p>

        Try changing your search or category.

    </p>

    </div>
    `;

    return;
    }

    const filteredServices =
    services.filter(service => {

        const matchesSearch =

            service.title
            .toLowerCase()
            .includes(searchText)

            ||

            service.description
            .toLowerCase()
            .includes(searchText);

        const matchesCategory =

            selectedCategory === "All"

            ||

            service.category ===
            selectedCategory;

        return (
            matchesSearch &&
            matchesCategory
        );

    });

    if (
        filteredServices.length === 0
    ) {

        ServicesContainer.innerHTML = `
            <p>
                No services found.
            </p>
        `;

        return;

    }

    filteredServices.forEach(service => {

        const card =
        document.createElement("div");

        card.classList.add("service-card");

        card.innerHTML = `

<div class="service-image">

    <i class="fa-solid fa-${getServiceIcon(service.category)}"></i>

</div>

<div class="service-info">

    <span class="service-category">

        ${service.category}

    </span>

    <h3>

        ${service.title}

    </h3>

    <p class="service-description">

        ${service.description}

    </p>

    <div class="service-meta">

        <span>

            ⭐ ${service.average_rating || "New"}

        </span>

        <span>

            ${service.total_reviews || 0} Reviews

        </span>

    </div>

    <div class="service-footer">

        <div>

            <strong>

                GH₵${service.rate}

            </strong>

            <small>

                / ${service.rate_type}

            </small>

        </div>

        <span class="provider">

            ${service.provider_name}

        </span>

    </div>

    <div class="service-actions">

        <button
            class="btn btn-secondary"
            onclick="messageProvider(${service.user_id})"
        >

            Message

        </button>

        <button
            class="btn btn-primary"
            onclick="viewService(${service.id})"
        >

            View

        </button>

    </div>

</div>

       `;

        ServicesContainer.appendChild(
            card
        );

    });

}

function messageProvider(userId) {

    localStorage.setItem(
        "receiver_id",
        userId
    );

    window.location.href =
    "conversation.html";

}

function viewService(id) {

    window.location.href =
    `service.html?id=${id}`;

}

searchService.addEventListener(
    "input",
    displayServices
);

function getServiceIcon(category){

    switch(category){

        case "Programming":
            return "code";

        case "Graphic Design":
            return "palette";

        case "Tutoring":
            return "graduation-cap";

        case "Photography":
            return "camera";

        case "Video Editing":
            return "film";

        case "Writing":
            return "pen";

        case "Marketing":
            return "bullhorn";

        default:
            return "briefcase";

    }

}


loadServices();