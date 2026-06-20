const myAPIKey = "a3121c30-d891-4e87-ab4d-ea4f03ccd26f";

//// API #1
// Gets a list of all products in a category as a JSON
export async function GetCategoryData(category) {
    const response = await fetch(`https://games-popularity.com/swagger/api/${category}?apiKey=${myAPIKey}`);
    if (!response.ok) { throw new Error("Failed to fetch data"); }

    const data = await response.json();
    return data.data;
}

// Gets details about a product's info as a JSON
export async function GetGameData(gameId) {
    const response = await fetch(`https://games-popularity.com/swagger/api/game/latest/${gameId}?apiKey=${myAPIKey}`);
    if (!response.ok) { throw new Error("Failed to fetch data"); }

    const data = await response.json();
    return data;
}

//// API #2
// Gets details about a product's sale as a JSON
export async function GetGameSaleInfo(gameId) {
    const response = await fetch(`https://www.cheapshark.com/api/1.0/deals?storeID=1&steamAppID=${gameId}`);
    if (!response.ok) { throw new Error("Failed to fetch data"); }

    const deals = await response.json();

    if (deals.length === 0) { return; }

    return deals[0];
}