const AI_SEARCH_ENDPOINT =
    "https://acity-backend.onrender.com/api/ai/buyer/search";

const aiSearchInput = document.getElementById("aiSearchInput");
const aiSearchButton = document.getElementById("aiSearchBtn");
const aiExplanation = document.getElementById("aiExplanation");
const featuredContainer = document.getElementById("featuredProducts");

aiSearchInput.addEventListener("input", () => {

    if (aiSearchInput.value.trim() !== "") {
        return;
    }

    aiExplanation.innerHTML = "";

    loadFeaturedProducts();

});

function getAuthToken() {
    return (
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        ""
    );
}

async function performAiSearch() {
    const query = aiSearchInput.value.trim();

    if (!query) {

        aiExplanation.innerHTML = "";

        loadFeaturedProducts();

        return;

    }

    if (!query) {
        showToast("Enter something to search.");
        return;
    }

    aiSearchButton.disabled = true;
    aiSearchButton.innerHTML =
    `<i class="fa-solid fa-spinner fa-spin"></i>`;

    aiExplanation.style.display = "none";

    featuredContainer.innerHTML = `
        <div class="empty-state">
            <i class="fa-solid fa-robot"></i>
            <h3>Acity AI is searching...</h3>
            <p>Finding the best listings for you.</p>
        </div>
    `;

    try {
        const response = await fetch(AI_SEARCH_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization:
                    `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({
                query
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Search failed."
            );
        }

        featuredContainer.innerHTML = "";

        aiExplanation.style.display = "block";
        aiExplanation.innerHTML = `
            <div class="ai-explanation-card">
                <div class="ai-title">
                    ✨ Acity AI
                </div>

                <p>${data.explanation}</p>
            </div>
        `;

        if (!data.results.length) {
            featuredContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-box-open"></i>
                    <h3>No Results</h3>
                    <p>
                        Acity AI couldn't find matching listings.
                    </p>
                </div>
            `;
            return;
        }

        data.results.forEach(item => {

            const card =
                createPublicListingCard(item);

            const badge =
                document.createElement("div");

            badge.className = "ai-reason";

            let message = "";

            if (item.stock_quantity > 0) {
                message = "✅ In Stock";
            } else {
                message = "⚠️ Out of Stock";
            }

            badge.innerHTML = `
                <i class="fa-solid fa-wand-magic-sparkles"></i>
                <span>${message}</span>
            `;

            card.appendChild(badge);

            featuredContainer.appendChild(card);

        });

    } catch (error) {

        console.error("AI Search Error:", error);

        featuredContainer.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <h3>AI Search Failed</h3>
                <p>${error.message}</p>
            </div>
        `;

    } finally {

        aiSearchButton.disabled = false;

        aiSearchButton.innerHTML =
            `<i class="fa-solid fa-arrow-right"></i>`;
    }
}

if (aiSearchButton) {

    aiSearchButton.addEventListener(
        "click",
        performAiSearch
    );

    aiSearchInput.addEventListener(
        "keydown",
        e => {
            if (e.key === "Enter") {
                performAiSearch();
            }
        }
    );

}