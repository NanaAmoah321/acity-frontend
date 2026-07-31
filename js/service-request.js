const API_BASE =
    "https://acity-backend.onrender.com/api";

const serviceSummary =
    document.getElementById("serviceSummary");

const categoryRequestFields =
    document.getElementById("categoryRequestFields");

const requestTitle =
    document.getElementById("requestTitle");

const requestIntro =
    document.getElementById("requestIntro");

const requestForm =
    document.getElementById("serviceRequestForm");

const submitButton =
    document.getElementById("submitServiceRequest");

const serviceId = Number(
    new URLSearchParams(window.location.search).get("id")
);

let selectedService = null;

const categoryFields = {
    delivery: [
        {
            name: "pickup_location",
            label: "Pickup location",
            type: "text",
            required: true,
            placeholder: "e.g. Hostel A, Room 20"
        },
        {
            name: "dropoff_location",
            label: "Drop-off location",
            type: "text",
            required: true,
            placeholder: "e.g. BB Hostel"
        },
        {
            name: "preferred_date",
            label: "Preferred delivery date",
            type: "date",
            required: true
        },
        {
            name: "preferred_time",
            label: "Preferred delivery time",
            type: "time",
            required: true
        },
        {
            name: "item_size",
            label: "Item size",
            type: "select",
            required: true,
            options: [
                "Small",
                "Medium",
                "Large",
                "Extra large"
            ]
        },
        {
            name: "quantity",
            label: "Quantity",
            type: "number",
            required: true,
            min: 1,
            value: 1
        },
        {
            name: "additional_details",
            label: "Extra instructions",
            type: "textarea",
            placeholder:
                "Add pickup notes, handling instructions, or anything else the provider should know."
        }
    ],

    tutoring: [
        {
            name: "course",
            label: "Course or subject",
            type: "text",
            required: true,
            placeholder: "e.g. Calculus, Python, JAVA"
        },
        {
            name: "topic",
            label: "Topic you need help with",
            type: "text",
            required: true
        },
        {
            name: "level",
            label: "Level of Understanding",
            type: "select",
            required: true,
            options: [
                "Beginner",
                "Intermediate",
                "Advanced"
            ]
        },
        {
            name: "preferred_date",
            label: "Preferred session date",
            type: "date",
            required: true
        },
        {
            name: "preferred_time",
            label: "Preferred session time",
            type: "time",
            required: true
        },
        {
            name: "session_format",
            label: "Session format",
            type: "select",
            required: true,
            options: [
                "In person",
                "Online",
                "Either"
            ]
        },
        {
            name: "additional_details",
            label: "Anything else to add?",
            type: "textarea",
            placeholder:
                "Include questions, assignment details, or areas you find difficult."
        }
    ],

    programming: [
        {
            name: "project_type",
            label: "Project type",
            type: "select",
            required: true,
            options: [
                "Website",
                "Mobile app",
                "Desktop app",
                "Bug fix",
                "Other"
            ]
        },
        {
            name: "required_features",
            label: "Required features",
            type: "textarea",
            required: true,
            placeholder:
                "Describe what the project should do."
        },
        {
            name: "deadline",
            label: "Preferred deadline",
            type: "date",
            required: true
        },
        {
            name: "existing_link",
            label: "Existing website or project link",
            type: "url",
            placeholder: "https://"
        },
        {
            name: "additional_details",
            label: "Extra details",
            type: "textarea",
            placeholder:
                "Include preferred technology, design references, or constraints."
        }
    ],

    "graphic design": [
        {
            name: "design_type",
            label: "Design type",
            type: "select",
            required: true,
            options: [
                "Logo",
                "Poster",
                "Flyer",
                "Social media post",
                "Branding",
                "Other"
            ]
        },
        {
            name: "dimensions",
            label: "Dimensions or platform",
            type: "text",
            placeholder:
                "e.g. Instagram post, A4 poster, 1920 × 1080"
        },
        {
            name: "deadline",
            label: "Preferred deadline",
            type: "date",
            required: true
        },
        {
            name: "style_reference",
            label: "Style or reference link",
            type: "url",
            placeholder: "https://"
        },
        {
            name: "additional_details",
            label: "Design brief",
            type: "textarea",
            required: true,
            placeholder:
                "Describe your brand, colours, wording, and preferred style."
        }
    ],

    photography: [
        {
            name: "event_type",
            label: "Event or shoot type",
            type: "text",
            required: true,
            placeholder:
                "e.g. Graduation shoot, birthday, product photos"
        },
        {
            name: "location",
            label: "Location",
            type: "text",
            required: true
        },
        {
            name: "preferred_date",
            label: "Preferred date",
            type: "date",
            required: true
        },
        {
            name: "preferred_time",
            label: "Preferred time",
            type: "time",
            required: true
        },
        {
            name: "duration",
            label: "Expected duration",
            type: "text",
            placeholder: "e.g. 2 hours"
        },
        {
            name: "additional_details",
            label: "Extra details",
            type: "textarea"
        }
    ],

    "video editing": [
        {
            name: "video_type",
            label: "Video type",
            type: "text",
            required: true,
            placeholder:
                "e.g. YouTube video, event highlight, social media reel"
        },
        {
            name: "video_length",
            label: "Approximate final video length",
            type: "text",
            placeholder: "e.g. 60 seconds"
        },
        {
            name: "deadline",
            label: "Preferred deadline",
            type: "date",
            required: true
        },
        {
            name: "footage_link",
            label: "Footage or reference link",
            type: "url",
            placeholder: "https://"
        },
        {
            name: "additional_details",
            label: "Editing brief",
            type: "textarea",
            required: true,
            placeholder:
                "Describe the style, music, captions, transitions, and key moments."
        }
    ],

    writing: [
        {
            name: "document_type",
            label: "Document type",
            type: "text",
            required: true,
            placeholder:
                "e.g. CV, article, report, proofread document"
        },
        {
            name: "word_count",
            label: "Estimated word count",
            type: "number",
            min: 1
        },
        {
            name: "deadline",
            label: "Preferred deadline",
            type: "date",
            required: true
        },
        {
            name: "citation_style",
            label: "Citation style, if applicable",
            type: "text",
            placeholder: "e.g. APA, Harvard, MLA"
        },
        {
            name: "additional_details",
            label: "What do you need?",
            type: "textarea",
            required: true
        }
    ],

    marketing: [
        {
            name: "marketing_goal",
            label: "Main goal",
            type: "text",
            required: true,
            placeholder:
                "e.g. Promote an event, grow social media, launch a product"
        },
        {
            name: "target_audience",
            label: "Target audience",
            type: "text",
            required: true
        },
        {
            name: "deadline",
            label: "Preferred start date",
            type: "date"
        },
        {
            name: "additional_details",
            label: "Campaign details",
            type: "textarea",
            required: true
        }
    ],

    other: [
        {
            name: "what_you_need",
            label: "What do you need?",
            type: "textarea",
            required: true,
            placeholder:
                "Describe the service you need as clearly as possible."
        },
        {
            name: "preferred_date",
            label: "When do you need it?",
            type: "date"
        },
        {
            name: "preferred_location",
            label: "Preferred location",
            type: "text",
            placeholder:
                "Leave blank if the service can be done online."
        },
        {
            name: "budget",
            label: "Your budget, optional",
            type: "number",
            min: 0,
            placeholder: "GH₵"
        }
    ]
};

function getCategoryKey(category) {
    const normalizedCategory =
        (category || "")
            .trim()
            .toLowerCase();

    return categoryFields[normalizedCategory]
        ? normalizedCategory
        : "other";
}

function createField(field) {
    const wrapper =
        document.createElement("div");

    wrapper.className = "request-field";

    const label =
        document.createElement("label");

    label.htmlFor = field.name;
    label.textContent = field.label;

    let control;

    if (field.type === "textarea") {
        control = document.createElement("textarea");
        control.rows = 4;
    } else if (field.type === "select") {
        control = document.createElement("select");

        const placeholderOption =
            document.createElement("option");

        placeholderOption.value = "";
        placeholderOption.textContent =
            `Select ${field.label.toLowerCase()}`;
        placeholderOption.disabled = true;
        placeholderOption.selected = true;

        control.appendChild(placeholderOption);

        field.options.forEach(optionText => {
            const option =
                document.createElement("option");

            option.value = optionText;
            option.textContent = optionText;

            control.appendChild(option);
        });
    } else {
        control = document.createElement("input");
        control.type = field.type || "text";
    }

    control.id = field.name;
    control.name = field.name;
    control.className =
        field.type === "select"
            ? "form-select"
            : "form-control";

    control.required = Boolean(field.required);

    if (field.placeholder) {
        control.placeholder = field.placeholder;
    }

    if (field.min !== undefined) {
        control.min = field.min;
    }

    if (field.value !== undefined) {
        control.value = field.value;
    }

    wrapper.append(label, control);

    return wrapper;
}

function renderRequestFields(category) {
    categoryRequestFields.replaceChildren();

    const fields =
        categoryFields[getCategoryKey(category)];

    fields.forEach(field => {
        categoryRequestFields.appendChild(
            createField(field)
        );
    });
}

function renderServiceSummary(service) {
    serviceSummary.replaceChildren();

    const category =
        document.createElement("span");

    category.className = "service-category";
    category.textContent =
        service.category || "Other";

    const title =
        document.createElement("h2");

    title.textContent = service.title;

    const description =
        document.createElement("p");

    description.className =
        "service-summary-description";

    description.textContent =
        service.description;

    const provider =
        document.createElement("p");

    provider.className =
        "service-summary-provider";

    provider.textContent =
        `Provided by ${service.provider_name}`;

    const pricing =
        document.createElement("div");

    pricing.className =
        "service-summary-pricing";

    const rate =
        document.createElement("strong");

    rate.textContent =
        `GH₵${Number(service.rate).toFixed(2)}`;

    const rateType =
        document.createElement("span");

    rateType.textContent =
        ` / ${service.rate_type || "Service"}`;

    pricing.append(rate, rateType);

    const rating =
        document.createElement("p");

    rating.className =
        "service-summary-rating";

    rating.textContent =
        `★ ${
            Number(service.average_rating) || "New"
        } · ${
            service.total_reviews || 0
        } reviews`;

    serviceSummary.append(
        category,
        title,
        description,
        provider,
        pricing,
        rating
    );
}

async function loadService() {
    if (!Number.isInteger(serviceId) || serviceId <= 0) {
        serviceSummary.textContent =
            "This service request link is invalid.";

        categoryRequestFields.textContent =
            "Please return to Services and choose a service again.";

        submitButton.disabled = true;
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE}/services/${serviceId}`
        );

        const service = await response.json();

        if (!response.ok) {
            throw new Error(
                service.error ||
                "Could not load service."
            );
        }

        selectedService = service;

        renderServiceSummary(service);
        renderRequestFields(service.category);

        requestTitle.textContent =
            `Request ${service.title}`;

        requestIntro.textContent =
            `Give ${service.provider_name} the details needed to respond clearly.`;

        submitButton.innerHTML = `
            <i class="fa-solid fa-paper-plane"></i>
            Send ${service.category || "service"} request
        `;

    } catch (error) {
        console.error("Service request load error:", error);

        serviceSummary.textContent =
            "Could not load this service.";

        categoryRequestFields.textContent =
            "Please return to Services and try again.";

        submitButton.disabled = true;

        if (typeof showToast === "function") {
            showToast(
                "Could not load this service.",
                "error"
            );
        }
    }
}

requestForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (!selectedService) {
        return;
    }

    if (!requestForm.checkValidity()) {
        requestForm.reportValidity();
        return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    const requestDetails = Object.fromEntries(
        new FormData(requestForm).entries()
    );

    const originalButtonContent =
        submitButton.innerHTML;

    submitButton.disabled = true;

    submitButton.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Sending request…
    `;

    try {
        const response = await fetch(
            `${API_BASE}/services/${selectedService.id}/requests`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    request_details: requestDetails
                })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.error ||
                "Could not send service request."
            );
        }

        localStorage.removeItem("conversationListing");
        localStorage.removeItem("conversationService");

        localStorage.setItem(
            "openConversationWith",
            selectedService.user_id
        );

        localStorage.setItem(
            "openConversationName",
            selectedService.provider_name
        );

        window.location.href = "inbox.html";

    } catch (error) {
        console.error(
            "Service request error:",
            error
        );

        if (typeof showToast === "function") {
            showToast(
                error.message ||
                "Could not send service request.",
                "error"
            );
        }

        submitButton.disabled = false;
        submitButton.innerHTML =
            originalButtonContent;
    }
});

loadService();