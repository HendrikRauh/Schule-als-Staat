const sqlite3 = require('better-sqlite3');
const crypto = require('crypto');

class Database {
    constructor(databaseName) {
        this.db = new sqlite3(databaseName);
    }

    createPeopleTable() {
        this.db.prepare('CREATE TABLE IF NOT EXISTS people (id TEXT PRIMARY KEY, firstName, lastName, colorCode INTEGER)').run();
    }

    generateMD5Hash(input) {
        return crypto.createHash('md5').update(input).digest('hex');
    }

    insertPerson(firstName, lastName, colorCode) {
        const id = this.generateMD5Hash(firstName + lastName);
        this.db.prepare(`INSERT INTO people (id, firstName, lastName, colorCode) VALUES ('', '', '', )`).run();
    }
}

// Usage
const db = new Database('my-database.db');
db.createPeopleTable();
db.insertPerson('Hendrik', 'Rauh', 1);