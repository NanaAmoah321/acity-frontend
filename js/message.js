const sendBtn =
document.getElementById("sendBtn");

sendBtn.addEventListener(
    "click",
    async () => {

        const token =
        localStorage.getItem("token");

        const receiver_id =
        localStorage.getItem("receiver_id");

        const message =
        document.getElementById("message").value;

        const res = await fetch(
            "https://acity-backend.onrender.com/api/messages",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization":
                    `Bearer ${token}`
                },

                body: JSON.stringify({
                    receiver_id,
                    message
                })
            }
        );

        const data =
        await res.json();

        if (res.ok) {

            alert(
                "Message sent!"
            );

        } else {

            alert(
                data.error
            );

        }

    }
);