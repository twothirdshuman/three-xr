export const username = (() => {
    const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789-_";
    let ret = "";
    for (let i = 0; i < 8; i++) {
        ret += letters[Math.floor(Math.random() * (letters.length))]
    }
    return ret;
})();