const ServicesContainer =
document.getElementById("servicesContainer");
const searchService =
document.getElementById("searchService");
let selectedCategory = "All";
document
.querySelectorAll(".mobile-categories button")
.forEach(button => {
    button.addEventListener("click", () => {
        document
        .querySelectorAll(".mobile-categories button")
        .forEach(btn =>
            btn.classList.remove("active")
        );
        button.classList.add("active");
        selectedCategory =
        button.dataset.category;
        displayServices();
    });
});
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
    (service.title || "")
        .toLowerCase()
        .includes(searchText)
    ||
    (service.description || "")
        .toLowerCase()
        .includes(searchText)
    ||
    (service.provider_name || "")
        .toLowerCase()
        .includes(searchText)
    ||
    (service.category || "")
        .toLowerCase()
        .includes(searchText);
        const matchesCategory =
            selectedCategory === "All"
            ||
            (service.category || "")
                .toLowerCase()
                .trim() ===
            selectedCategory
                .toLowerCase()
                .trim();
        return (
            matchesSearch &&
            matchesCategory
        );
    });
    if (
        filteredServices.length === 0
    ) {
        ServicesContainer.innerHTML = `
<div class="empty-state">
    <i class="fa-solid fa-screwdriver-wrench"></i>
    <h3>No matching services</h3>
    <p>
        Try another keyword or category.
    </p>
</div>
`;
        return;
    }
    filteredServices.forEach(service => {
        console.log(service);
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
            onclick="messageProvider(
                ${service.user_id},
                '${service.provider_name}',
                ${service.id},
                '${service.title.replace(/'/g,"\\'")}',
                '${service.category}',
                '${service.image_url || ""}'
            )"
        >
            Message
        </button>
    </div>
</div>
       `;
        ServicesContainer.appendChild(
            card
        );
    });
}
function messageProvider(
    providerId,
    providerName,
    serviceId,
    serviceTitle,
    serviceCategory,
    serviceImage
){

    console.log({
    providerId,
    providerName,
    serviceId
    });

    localStorage.removeItem(
        "conversationListing"
    );

    localStorage.setItem(
        "conversationService",
        JSON.stringify({

            id: serviceId,

            title: serviceTitle,

            category: serviceCategory,

            image: serviceImage

        })
    );

    localStorage.setItem(
        "openConversationWith",
        providerId
    );

    localStorage.setItem(
        "openConversationName",
        providerName
    );

    window.location.href =
        "inbox.html";

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