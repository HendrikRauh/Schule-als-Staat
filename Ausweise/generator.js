const crypto = require('crypto');

function hashMD5(input) {
    return crypto.createHash('md5').update(input).digest('hex');
}

function test() {
    const input = 'HendrikRauh';
    const output = hashMD5(input);
    console.log(output);
    // 5d5f984317bc1ab7be36442206faa716
}
