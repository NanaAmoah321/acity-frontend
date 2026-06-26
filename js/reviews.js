const reviewUser =
JSON.parse(
    localStorage.getItem("user")
);

console.log("User:", reviewUser);

async function loadReviews() {

    const ratingRes =
    await fetch(
        `https://acity-backend.onrender.com/api/reviews/rating/${reviewUser.id}`
    );

    

    const rating =
    await ratingRes.json();

    const ratingValue =
    document.getElementById("ratingValue");

    if (ratingValue) {
       ratingValue.textContent =
       Number(rating.average_rating || 0).toFixed(1);
    }

    console.log("Rating:", rating);

    document.getElementById(
        "ratingContainer"
    ).innerHTML = `
        <h3>
            ⭐ ${rating.average_rating || "0.0"}
            (${rating.total_reviews || 0} Reviews)
        </h3>
    `;

    const reviewsRes =
    await fetch(
        `https://acity-backend.onrender.com/api/reviews/${reviewUser.id}`
    );

    const reviews =
    await reviewsRes.json();

    const reviewsCount =
    document.getElementById("reviewsCount");

    if (reviewsCount) {
        reviewsCount.textContent =
        reviews.length;
    }

    console.log("Reviews:", reviews);

    const container =
    document.getElementById(
        "reviewsContainer"
    );

    container.innerHTML = "";

    reviews.forEach(review => {

        const stars =
        "⭐".repeat(
            review.rating
        );

        const card =
        document.createElement("div");

        card.classList.add("review-card");

        card.innerHTML = `
            <h3>${stars}</h3>
            <p>${review.comment}</p>
            <small>
                By ${review.reviewer_name}
            </small>
        `;

        container.appendChild(card);

    });

}

loadReviews();