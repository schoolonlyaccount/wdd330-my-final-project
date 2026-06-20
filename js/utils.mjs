// A simplified version to access a key in the local storage
export function getLocalStorage(key) {
    return JSON.parse(localStorage.getItem(key));
}

// A simplified version to set/add a key with a value in the local storage
export function setLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}