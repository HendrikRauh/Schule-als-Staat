/*
 * This file provides a function to generate an MD5 hash from a string using the crypto library.
 */

const crypto = require('crypto');

function generateMD5Hash(inputString) {
  const md5sum = crypto.createHash('md5');
  md5sum.update(inputString);
  return md5sum.digest('hex');
}

module.exports = generateMD5Hash;