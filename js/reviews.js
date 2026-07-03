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

    document.getElementById("ratingValue").textContent =
    ratingValue.textContent;

    console.log("Rating:", rating);

    

    const reviewsRes =
    await fetch(
        `https://acity-backend.onrender.com/api/reviews/${reviewUser.id}`
    );

    const reviews =
    await reviewsRes.json();

    document.getElementById("reviewCount").textContent =
    reviews.length;

    const reviewsCount =
    document.getElementById("reviewsCount");

    if (reviewsCount) {
        reviewsCount.textContent =
        reviews.length;
    }

    console.log("Reviews:", reviews);

    const container =
    document.getElementById("reviewsContainer");

    if(!container) return;

    container.innerHTML = "";

    if(reviews.length === 0){

    container.innerHTML = `

        <div class="empty-state">

            <i class="fa-solid fa-star"></i>

            <h3>No Reviews Yet</h3>

            <p>
                Once students review you, they'll appear here.
            </p>

        </div>

    `;

    return;

}

    reviews.forEach(review => {

        const stars =
        "⭐".repeat(
            review.rating
        );

        const card =
        document.createElement("div");

        card.classList.add("review-card");

        card.innerHTML = `

<div class="review-top">

    <div class="review-avatar">

        ${review.reviewer_name.charAt(0)}

    </div>

    <div>

        <h4>${review.reviewer_name}</h4>

        <div class="review-stars">

            ${stars}

        </div>

    </div>

</div>

<p class="review-comment">

    "${review.comment}"

</p>

`;

        container.appendChild(card);

    });

}

loadReviews();