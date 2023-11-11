const crypto = require("crypto");

/**
 * This methods generates a sha256 hash from a string and returns it.
 * @param {string} inputString - The string that should be hashed
 * @returns the hashed string
 */
function generateHash(inputString) {
    const hash = crypto.createHash("sha256");
    hash.update(inputString);
    return hash.digest("hex");
}

module.exports = generateHash;
