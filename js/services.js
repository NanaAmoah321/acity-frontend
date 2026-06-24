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
            "http://localhost:5000/api/services"
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
            <h3>No Services Yet</h3>
            <p>Be the first student to post a service.</p>
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

            <h3>${service.title}</h3>

            <p>
                ${service.description}
            </p>

            <p>
                <strong>
                    Provider:
                </strong>

                ${
                    service.provider_name
                }
            </p>

            <p>
                ⭐ ${
                    service.average_rating
                    || "No rating"
                }

                (
                    ${
                        service.total_reviews
                        || 0
                    }

                    Reviews
                )
            </p>

            <p>
                <strong>
                    Category:
                </strong>

                ${
                    service.category
                }
            </p>

            <p>
                <strong>
                    Rate:
                </strong>

                ₵${
                    service.rate
                }
                ${service.rate_type}
            </p>

            <div class="service-actions">

                <button
                    onclick="viewService(${service.id})"
                >
                    View Details
                </button>

                <button
                    onclick="messageProvider(${service.user_id})"
                >
                     Message
                </button>

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



loadServices();