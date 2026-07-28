const reviewUser =
JSON.parse(
    localStorage.getItem("user")
);
("User:", reviewUser);
async function loadReviews() {
    if (!reviewUser?.id) {
        return;
    }

    try {
        const ratingRes = await fetch(
            `https://acity-backend.onrender.com/api/reviews/rating/${reviewUser.id}`
        );

        if (!ratingRes.ok) {
            throw new Error("Could not load rating.");
        }

        const rating = await ratingRes.json();

        const ratingValue = document.getElementById("ratingValue");

        if (ratingValue) {
            ratingValue.textContent =
                Number(rating.average_rating || 0).toFixed(1);
        }

        const reviewsRes = await fetch(
            `https://acity-backend.onrender.com/api/reviews/${reviewUser.id}`
        );

        if (!reviewsRes.ok) {
            throw new Error("Could not load reviews.");
        }

        const reviews = await reviewsRes.json();

        if (!Array.isArray(reviews)) {
            throw new Error("Invalid reviews response.");
        }

        const reviewCount = document.getElementById("reviewCount");
        const reviewsCount = document.getElementById("reviewsCount");

        if (reviewCount) {
            reviewCount.textContent = reviews.length;
        }

        if (reviewsCount) {
            reviewsCount.textContent = reviews.length;
        }

        const container = document.getElementById("reviewsContainer");

        if (!container) {
            return;
        }

        container.replaceChildren();

        if (reviews.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-star"></i>
                    <h3>No Reviews Yet</h3>
                    <p>Once students review you, they'll appear here.</p>
                </div>
            `;
            return;
        }

        reviews.forEach(review => {
            const card = document.createElement("article");
            card.className = "review-card";

            const top = document.createElement("div");
            top.className = "review-top";

            const avatar = document.createElement("div");
            avatar.className = "review-avatar";
            avatar.textContent =
                (review.reviewer_name || "U").charAt(0).toUpperCase();

            const details = document.createElement("div");

            const name = document.createElement("h4");
            name.textContent = review.reviewer_name || "Anonymous";

            const stars = document.createElement("div");
            stars.className = "review-stars";

            const score = Math.max(
                0,
                Math.min(5, Number(review.rating) || 0)
            );

            stars.textContent = "⭐".repeat(score);

            details.append(name, stars);
            top.append(avatar, details);

            const comment = document.createElement("p");
            comment.className = "review-comment";
            comment.textContent = review.comment || "";

            card.append(top, comment);
            container.appendChild(card);
        });
    } catch (err) {
        console.error("Reviews load error:", err);

        const container = document.getElementById("reviewsContainer");

        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <h3>Could not load reviews</h3>
                    <p>Please refresh the page and try again.</p>
                </div>
            `;
        }
    }
}

loadReviews();