/*
This module contains a function that validates an ID card string.

The ID card string is expected to be a comma-separated string consisting of the first name, surname, class, and an MD5 hash. The MD5 hash is generated from the first name, surname, and class, each separated by "-MBG-".

Example:

Input: 'Hendrik,Rauh,J1,13d7eba0d91233d0d89448fe7158a9d6'
Output: true

In this example, '13d7eba0d91233d0d89448fe7158a9d6' is the MD5 hash of 'Hendrik-MBG-Rauh-MBG-J1'.
*/

const generateMD5Hash = require('./hashing');

function isValidIdCard(idCardString) {
  const [firstName, surname, className, hash] = idCardString.split(',');

  // Generate the md5 hash of the information
  const expectedHash = generateMD5Hash(`${firstName}-MBG-${surname}-MBG-${className}`);

  // Compare the expected hash with the provided hash
  return expectedHash === hash;
}

console.log(isValidIdCard('Hendrik,Rauh,J1,13d7eba0d91233d0d89448fe7158a9d6'));