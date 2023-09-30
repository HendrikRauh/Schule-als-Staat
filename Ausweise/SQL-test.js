const sqlite3 = require('better-sqlite3');
const crypto = require('crypto');

class Database {
    constructor(databaseName) {
        this.db = new sqlite3(databaseName);
    }

    createPeopleTable() {
        this.db.prepare('CREATE TABLE IF NOT EXISTS people (id TEXT PRIMARY KEY, firstName TEXT, lastName TEXT, className TEXT, colorCode INTEGER)').run();
    }

    generateMD5Hash(input) {
        return crypto.createHash('md5').update(input).digest('hex');
    }

    insertPerson(firstName, lastName, className, colorCode) {
        const id = this.generateMD5Hash(firstName + lastName);
        this.db.prepare(`INSERT OR REPLACE INTO people (id, firstName, lastName, className, colorCode) VALUES ('${id}', '${firstName}', '${lastName}', '${className}', ${colorCode})`).run();
    }
}

// Usage
const db = new Database('DATA.db');
db.createPeopleTable();
db.insertPerson('Hendrik', 'Rauh', 'J1', 1);
db.insertPerson('Raffael', 'Wolf', 'J1', 0);