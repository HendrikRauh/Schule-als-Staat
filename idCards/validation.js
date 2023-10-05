/*
* This file contains a function that validates an ID card string.
* The ID card string is a comma-separated string of the first name, surname, class, and an MD5 hash.
* The MD5 hash is generated from the first name, surname, and class, each separated by "-MBG-".
*/

const generateMD5Hash = require('./hashing');

function isValidIdCard(idCardString) {
  const [firstName, surname, className, hash] = idCardString.split(',');

  const expectedHash = generateMD5Hash(`${firstName}-MBG-${surname}-MBG-${className}`);

  return expectedHash === hash;
}

console.log(isValidIdCard('Hendrik,Rauh,J1,13d7eba0d91233d0d89448fe7158a9d6'));
