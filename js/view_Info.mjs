import { GetCategoryData, GetGameData, GetGameSaleInfo } from "./external_services.mjs";
import { getLocalStorage, setLocalStorage } from "./utils.mjs";

// Displays the top 10 games from a category
async function DisplayTop10View(category) {
    // Get the h1 in main
    const h1 = document.querySelector("h1");

    // Create a fragment document and get the targeted document
    const fragmentDocument = document.createDocumentFragment();
    const targetedDocument = document.getElementById(`${category}-view`);
    targetedDocument.innerHTML = "";

    // Update the h1 in main
    if (category === "top-sellers") { h1.innerText = "Home - Top Sellers"; }
    else if (category === "top-wishlist") { h1.innerText = "Home - Top Wishlist"; }
    else { return; }

    // Get the data
    const data = await GetCategoryData(category);

    // Verify the API returned valid data
    if (!data || data.length < 10) {
        targetedDocument.innerHTML = "<p>Unable to load game data.</p>";
        return;
    }

    // Store the first 10 indexes from the data
    const firstTen = [data[0], data[1], data[2], data[3], data[4], data[5], data[6], data[7], data[8], data[9]];

    // Build and append the HTML
    firstTen.forEach(element => {
        const gameCard = document.createElement("div");
        gameCard.classList.add("game-card", "fade-in");
        gameCard.innerHTML =
            `
            <h2>Ranked #${element.position}</h2>
            <img src="https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${element.steamId}/library_600x900.jpg" onerror="this.onerror=null;this.src='images/unknown-image-small.png';" width="300" height="450" alt="Cover art of ${element.gameName}" loading="lazy">
            <button class="open-dialog" data-id="${element.steamId}" data-name="${element.gameName}">View Details</button>
            `;

        fragmentDocument.appendChild(gameCard);
    });

    targetedDocument.appendChild(fragmentDocument);
}

// Displays the Top Spots view
async function DisplayTopSpots() {
    // Update the h1 in main
    document.querySelector("h1").innerText = "Home - Top Spots";

    // Create a fragment document and get the targeted document
    const fragmentDocument = document.createDocumentFragment();
    const targetedDocument = document.getElementById("top-spots-view");
    targetedDocument.innerHTML = "";

    // Get the data
    const dataSellers = await GetCategoryData("top-sellers");
    const dataWishlist = await GetCategoryData("top-wishlist");

    // Verify the API returned valid data
    if (!dataSellers?.length || !dataWishlist?.length) {
        targetedDocument.innerHTML =
            "<p>Unable to load game data.</p>";
        return;
    }

    // Build and append the HTML
    const gameCard1 = document.createElement("div");
    const gameCard2 = document.createElement("div");
    gameCard1.classList.add("game-card", "fade-in");
    gameCard2.classList.add("game-card", "fade-in");
    gameCard1.innerHTML =
        `
        <h2>Top Seller</h2>
        <img src="https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${dataSellers[0].steamId}/header.jpg" onerror="this.onerror=null;this.src='images/unknown-image-big.png';" width="690" height="322" alt="Cover art of Cover art of ${dataSellers[0].gameName}" loading="lazy">
        <button class="open-dialog" data-id="${dataSellers[0].steamId}" data-name="${dataSellers[0].gameName}">View Details</button>
        `;
    gameCard2.innerHTML =
        `
        <h2>Top Wishlisted</h2>
        <img src="https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${dataWishlist[0].steamId}/header.jpg" onerror="this.onerror=null;this.src='images/unknown-image-big.png';" width="690" height="322" alt="Cover art of ${dataWishlist[0].gameName}" loading="lazy">
        <button class="open-dialog" data-id="${dataWishlist[0].steamId}" data-name="${dataWishlist[0].gameName}">View Details</button>
        `;

    fragmentDocument.appendChild(gameCard1);
    fragmentDocument.appendChild(gameCard2);

    targetedDocument.appendChild(fragmentDocument);
}

// Displays the details of a game (dialog/modal)
function GameDetailsOpenAndClose() {
    // Get the dialog
    const dialog = document.getElementById("game-details");

    // Opening the dialog
    document.addEventListener("click", async (e) => {
        // Closest target
        const button = e.target.closest(".open-dialog");

        // If it exists
        if (button) {
            // Get info about the game
            const gameId = button.dataset.id;
            const gameName = button.dataset.name;
            const gameData = await GetGameData(gameId);
            const gameDeal = await GetGameSaleInfo(gameId);

            // Update the local storage for "last-viewed-game"
            SetLastViewedGame(gameName);

            // Calculations
            let salesAmount = "Unknown";
            if (gameDeal) {
                salesAmount = gameDeal.isOnSale === "1" ? `${((gameDeal.normalPrice - gameDeal.salePrice) / gameDeal.normalPrice * 100).toFixed(0)}% Off!` : "No";
            }
            const price = gameData.price.price != null ? (gameData.price.price != 0 ? `$${gameData.price.price}` : "Free") : "Unknown";
            if (price === "Free") { salesAmount = "It's Free"; }
            const followers = gameData.followers.followers != null ? gameData.followers.followers.toLocaleString() : "Unknown";
            const players = gameData.players.players != null ? gameData.players.players.toLocaleString() : "Unknown";
            const reviews = gameData.reviews.reviewsAll != null ? `+${(gameData.reviews.reviewsPositive / gameData.reviews.reviewsAll * 100).toFixed(0)}% / -${(gameData.reviews.reviewsNegative / gameData.reviews.reviewsAll * 100).toFixed(0)}%` : "Unknown";

            // The HTML of the dialog
            document.querySelector(".game-details-container").innerHTML =
                `
                <h2>${gameName}</h2>
                <div>
                    <div>
                        <h3>Price</h3>
                        <p>${price}</p>
                    </div>
                    <div>
                        <h3>On Sale</h3>
                        <p>${salesAmount}</p>
                    </div>
                    <div>
                        <h3>Followers</h3>
                        <p>${followers}</p>
                    </div>
                    <div>
                        <h3>Players in-game</h3>
                        <p>${players}</p>
                    </div>
                    <div>
                        <h3>Reviews</h3>
                        <p>${reviews}</p>
                    </div>
                </div>
            `;

            // Show it
            dialog.showModal();
        }
    });

    // Close the dialog
    document.querySelector(".close-dialog").addEventListener("click", () => dialog.close());
}

// Handles the switching of the views
function SwitchAndDisplayViewHandler() {
    // Get the documents
    const topSpotsButton = document.getElementById("top-spots-button");
    const topSellersButton = document.getElementById("top-sellers-button");
    const topWishlistButton = document.getElementById("top-wishlist-button");

    const topSpotsView = document.getElementById("top-spots-view");
    const topSellersView = document.getElementById("top-sellers-view");
    const topWishlistView = document.getElementById("top-wishlist-view");

    // For "View Top Spot for Each Category"
    topSpotsButton.addEventListener("click", () => {
        if (getLocalStorage("view-type") != 1) {
            topSpotsView.classList.add("view-active");
            topSellersView.classList.remove("view-active");
            topWishlistView.classList.remove("view-active");

            setLocalStorage("view-type", 1);

            DisplayTopSpots();
        }
    });

    // For "View Top Sellers"
    topSellersButton.addEventListener("click", () => {
        if (getLocalStorage("view-type") != 2) {
            topSpotsView.classList.remove("view-active");
            topSellersView.classList.add("view-active");
            topWishlistView.classList.remove("view-active");

            setLocalStorage("view-type", 2);

            DisplayTop10View("top-sellers");
        }
    });

    // For "View Top Wishlisted"
    topWishlistButton.addEventListener("click", () => {
        if (getLocalStorage("view-type") != 3) {
            topSpotsView.classList.remove("view-active");
            topSellersView.classList.remove("view-active");
            topWishlistView.classList.add("view-active");

            setLocalStorage("view-type", 3);

            DisplayTop10View("top-wishlist");
        }
    });
}

// Setups the local storage for the user's viewing type
function SetViewOnPageReload() {
    // Get local storage
    const viewType = getLocalStorage("view-type");

    // If local storage key exists then set the view to the local storage, otherwise set it to the default
    if (viewType) {
        switch (viewType) {
            default:
            case 1:
                document.getElementById("top-spots-view").classList.add("view-active");
                DisplayTopSpots();
                break;
            case 2:
                document.getElementById("top-sellers-view").classList.add("view-active");
                DisplayTop10View("top-sellers");
                break;
            case 3:
                document.getElementById("top-wishlist-view").classList.add("view-active");
                DisplayTop10View("top-wishlist");
        }
    } else {
        setLocalStorage("view-type", 1);
        document.getElementById("top-spots-view").classList.add("view-active");
        DisplayTopSpots();
    }
}

// Handles displaying & switching of a view and displaying of a game's details
export function InitViewInfo() {
    SetViewOnPageReload();
    SwitchAndDisplayViewHandler();
    GameDetailsOpenAndClose();
}

// Sets the welcome message depending on how long it's been since last visit
export function SetWelcomeMessage() {
    // Get the current time
    const now = new Date();

    // The message to display
    let message = "";

    // Get the local storage value
    const lastVisitString = getLocalStorage("last-visit");

    // If local storage key doesn't exist (null) then init default local storage and message
    if (!lastVisitString) {
        setLocalStorage("last-visit", now.toISOString());
        message = "Welcome! This appears to be your first visit.";
    } else {
        // Calculate the days since last visit
        const lastVisit = new Date(lastVisitString);
        const daysSinceVisit = Math.floor(
            (now - lastVisit) / (1000 * 60 * 60 * 24)
        );

        // Get message according to how long it's been
        if (daysSinceVisit === 0) {
            message = "Welcome back! You visited earlier today.";
        } else if (daysSinceVisit === 1) {
            message = "Welcome back! It's been 1 day since your last visit.";
        } else {
            message = `Welcome back! It's been ${daysSinceVisit} days since your last visit.`;
        }

        // Update local storage
        setLocalStorage("last-visit", now.toISOString());
    }

    // Set the message
    document.getElementById("welcome-message").innerText = message;
}

// Gets the last game you visited from the local storage and sets the message to it
export function GetLastViewedGame() {
    // Get the local storage
    const lastViewedGame = getLocalStorage("last-viewed-game");

    // If local storage is not null then set the message to the last game you visited, otherwise set it the default message
    document.getElementById("last-viewed-game").innerText = !lastViewedGame ? "You haven't viewed anything yet." : `Your last viewed game was ${lastViewedGame}.`;
}

// Sets the local storage to the last game you visited
function SetLastViewedGame(gameName) {
    // Set the local storage to the game you last visited
    setLocalStorage("last-viewed-game", gameName);

    // Refresh
    GetLastViewedGame();
}