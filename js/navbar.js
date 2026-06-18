const token =
localStorage.getItem(
    "token"
);

async function
loadUnreadCount() {

    if (!token) return;

    try {

        const res =
        await fetch(
            "http://localhost:5000/api/messages/unread-count",
            {
                headers: {
                    Authorization:
                    `Bearer ${token}`
                }
            }
        );

        const data =
        await res.json();

        const badge =
        document.getElementById(
            "messageCount"
        );

        if (
            Number(data.count) > 0
        ) {

            badge.innerText =
            `(${data.count})`;

        }

    } catch (err) {

        console.error(err);

    }

}

loadUnreadCount();

const menuToggle =
document.getElementById("menuToggle");

const navLinks =
document.getElementById("navLinks");

if (menuToggle) {

    menuToggle.addEventListener(
        "click",
        () => {

            navLinks.classList.toggle(
                "active"
            );

        }
    );

}