const serviceForm =
document.getElementById(
    "serviceForm"
);

serviceForm.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        const token =
        localStorage.getItem(
            "token"
        );

        const title =
        document.getElementById(
            "title"
        ).value;

        const description =
        document.getElementById(
            "description"
        ).value;

        const category =
        document.getElementById(
            "category"
        ).value;

        const rate =
        document.getElementById(
            "rate"
        ).value;

        const rate_type =
        document.getElementById("rateType").value;

        const portfolio_url =
        document.getElementById(
            "portfolio_url"
        ).value;

        const res =
        await fetch(
            "http://localhost:5000/api/services",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                    "application/json",

                    Authorization:
                    `Bearer ${token}`
                },

                body: JSON.stringify({
                    title,
                    description,
                    category,
                    rate,
                    rate_type,
                    portfolio_url
                })
            }
        );

        const data =
        await res.json();

        if (res.ok) {

            alert(
                "Service created successfully!"
            );

            window.location.href =
            "services.html";

        } else {

            alert(
                data.error ||
                data.message
            );

        }

    }
);