const fs = require("fs");
const generateHash = require("./hashing");

const salt = fs.readFileSync("../salt.key", "utf8").trim();

/**
 * This methods checks if a id matches the first name, last name and class name.
 * The sha256 hash is generated from the first name, surname, and class, each separated by a salt.
 * @param {string} idCardString - a comma-separated string without white space containing the first name, last name, class name and id as sha256 hash
 * @returns a boolean whether the id is valid for the data
 */
function isValidIdCard(idCardString) {
    const [firstName, surname, className, hash] = idCardString.split(",");

    const expectedHash = generateHash(`${firstName}${salt}${surname}${salt}${className}`);

    return expectedHash === hash;
}

console.log(isValidIdCard("Hendrik,Rauh,J1,13d7eba0d91233d0d89448fe7158a9d6"));
