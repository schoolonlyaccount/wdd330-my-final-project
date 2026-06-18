const myAPIKey = "a3121c30-d891-4e87-ab4d-ea4f03ccd26f";

//https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/{AppID}/library_600x900.jpg
//https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/{AppID}/capsule_616x353.jpg
//https://steamstatic.com{AppID}/header.jpg
//https://steamstatic.com{AppID}/page_bg_generated_v6b.jpg

async function GetCategoryData(category) {
    const response = await fetch(`https://games-popularity.com/swagger/api/${category}?apiKey=${myAPIKey}`);
    if (!response.ok) { return; }
    const data = await response.json();
    return data.data;
}

async function GetGameData(gameId) {
    const response = await fetch(`https://games-popularity.com/swagger/api/game/latest/${gameId}?apiKey=${myAPIKey}`);
    if (!response.ok) { return; }
    const data = await response.json();
    return data;
}

export async function DisplayDataTest(category) {
    const data1 = await GetCategoryData("top-sellers");
    const data2 = await GetGameData(data1[0].steamId);

    console.log(data1);
    console.log(data2);

    const gameCard = document.createElement("div");
    gameCard.classList.add('game-card');
    gameCard.innerHTML =
        `
        <h2>Title: ${data1[0].gameName}</h2>
        <p>Image: <img src="https://shared.steamstatic.com/store_item_assets/steam/apps/${data1[0].steamId}/library_600x900.jpg" alt"" loading="lazy"></p>
        <p>Pricing: ${data2.price.price != 0 ? `$${data2.price.price}` : "Free"}</p>
        <p>Followers: ${data2.followers.followers.toLocaleString()}</p>
        <p>Players in-game: ${data2.players.players.toLocaleString()}</p>
        <p>Reviews: ${(data2.reviews.reviewsPositive / data2.reviews.reviewsAll * 100).toFixed(0)}% Positive and ${(data2.reviews.reviewsNegative / data2.reviews.reviewsAll * 100).toFixed(0)}% Negative</p>
        `;

    document.getElementById("game-cards").appendChild(gameCard);
}

