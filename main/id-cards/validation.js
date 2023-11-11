/*
 * This file contains a function that validates an ID card string.
 * The ID card string is a comma-separated string of the first name, surname, class, and a sha256 hash.
 * The sha256 hash is generated from the first name, surname, and class, each separated by a salt.
 */

const fs = require("fs");
const generateHash = require("./hashing");

const salt = fs.readFileSync("../salt.key", "utf8").trim();

/**
 * This methods checks if a id matches the first name, last name and class name.
 * @param {string} idCardString - a string containing the first name, last name, class name and id, each separated by a comma without whitespace
 * @returns a boolean whether the id is valid for the data
 */
function isValidIdCard(idCardString) {
    const [firstName, surname, className, hash] = idCardString.split(",");

    const expectedHash = generateHash(`${firstName}${salt}${surname}${salt}${className}`);

    return expectedHash === hash;
}

console.log(isValidIdCard("Hendrik,Rauh,J1,13d7eba0d91233d0d89448fe7158a9d6"));
