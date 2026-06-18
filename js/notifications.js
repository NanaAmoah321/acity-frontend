const token =
localStorage.getItem("token");

async function loadNotifications() {

    try {

        const res =
        await fetch(
            "http://localhost:5000/api/notifications",
            {
                headers: {
                    Authorization:
                    `Bearer ${token}`
                }
            }
        );

        const notifications =
        await res.json();

        const container =
        document.getElementById(
            "notificationsContainer"
        );

        container.innerHTML = "";

        if (
            notifications.length === 0
        ) {

            container.innerHTML =
            `
            <div class="card">
                No notifications yet.
            </div>
            `;

            return;

        }

        notifications.forEach(
        notification => {

            const card =
            document.createElement(
                "div"
            );

            card.classList.add(
                "card"
            );

            card.innerHTML = `

                <p>
                    ${notification.message}
                </p>

                <small>
                    ${new Date(
                        notification.created_at
                    ).toLocaleString()}
                </small>

            `;

            container.appendChild(
                card
            );

        });

    } catch (err) {

        console.error(err);

    }

}

loadNotifications();