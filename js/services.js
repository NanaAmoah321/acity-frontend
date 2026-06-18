const ServicesContainer =
document.getElementById("ServicesContainer");

const searchService =
document.getElementById("searchService");

const categoryFilter =
document.getElementById("categoryFilter");

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

    const selectedCategory =
    categoryFilter.value;

    ServicesContainer.innerHTML = "";

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

        card.classList.add("card");

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
            </p>

            <button
                onclick="
                viewService(
                ${service.id}
                )"
            >
                View Details
            </button>

            <button
                onclick="
                messageProvider(
                ${service.user_id}
                )"
            >
                Message Provider
            </button>

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
    "message.html";

}

function viewService(id) {

    window.location.href =
    `service.html?id=${id}`;

}

searchService.addEventListener(
    "input",
    displayServices
);

categoryFilter.addEventListener(
    "change",
    displayServices
);

loadServices();