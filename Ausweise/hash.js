const crypto = require('crypto');

function generateMD5Hash(input) {
    return crypto.createHash('md5').update(input).digest('hex');
}

module.exports = generateMD5Hash;
