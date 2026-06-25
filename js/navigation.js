function messageSeller(userId) {

    localStorage.setItem(
        "receiver_id",
        userId
    );

    window.location.href =
    "conversation.html";

}

function messageProvider(userId) {

    localStorage.setItem(
        "receiver_id",
        userId
    );

    window.location.href =
    "conversation.html";

}

function viewListing(id) {

    window.location.href =
    `listing.html?id=${id}`;

}

function viewStore(userId) {

    window.location.href =
    `listing.html?id=${userId}`;

}

function viewService(id) {

    window.location.href =
    `service.html?id=${id}`;

}