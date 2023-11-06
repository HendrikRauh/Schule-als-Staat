/*
 * This file contains a function to generate an sha256 hash from a string.
 */

const crypto = require("crypto");

function generateHash(inputString) {
    const hash = crypto.createHash("sha256");
    hash.update(inputString);
    return hash.digest("hex");
}

module.exports = generateHash;
