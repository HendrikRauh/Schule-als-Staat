/**
 * This file defines a Database class which holds the different tables of the database.
 * Tables:
 * - People: contains methods for creating a people table,
 *           inserting a person into the table,
 *           getting a person by first name,
 *           and getting all people from the table.
 * 
 * - Attendance: contains methods for createing a attendance table,
 *               checking an person in and out by their Id,
 *               and retrieve by Id wheter a person is checked in.
 */

const sqlite3 = require("better-sqlite3");
const generateHash = require("./id-cards/hashing");
const fs = require("fs");

const salt = fs.readFileSync("salt.key", "utf8").trim();

class Database {
    constructor(databaseName) {
        this.db = new sqlite3(databaseName);

        this.People = new TablePeople(this.db);
        this.Attendance = new TableAttendance(this.db);
    }
}

class TablePeople {
    constructor(database) {
        this.db = database;
    }

    createPeopleTable() {
        this.db
            .prepare(
                "CREATE TABLE IF NOT EXISTS people (id TEXT PRIMARY KEY, firstName TEXT, lastName TEXT, className TEXT, colorCode TEXT)"
            )
            .run();
    }

    insertPerson(firstName, lastName, className, colorCode) {
        const id = generateHash(`${firstName}${salt}${lastName}${salt}${className}`);
        this.db
            .prepare(
                `INSERT OR REPLACE INTO people (id, firstName, lastName, className, colorCode) VALUES (?, ?, ?, ?, ?)`
            )
            .run(id, firstName, lastName, className, colorCode);
    }

    getPerson(firstName) {
        const stmt = this.db.prepare("SELECT * FROM people WHERE firstName = ?");
        const person = stmt.get(firstName);
        return person;
    }

    getAllPeople() {
        const stmt = this.db.prepare("SELECT * FROM people");
        const people = stmt.all();
        return people;
    }
}

class TableAttendance {
    // private attributes
    #tableName;
    #keyPrimary;
    #keyPersonId;
    #keyCheckIn;
    #keyCheckOut;

    constructor(database) {
        this.db = database;
        this.checkOutDefaultValue = 0;

        this.#keyPrimary = "id";
        this.#tableName = "attendance";
        this.#keyPersonId = "personId";
        this.#keyCheckIn = "checkIn";
        this.#keyCheckOut = "checkOut";
    }

    createTable() {
        this.db
            .prepare(
                `CREATE TABLE IF NOT EXISTS ${this.#tableName} (
                    ${this.#keyPrimary} int AUTO_INCREMENT,
                    ${this.#keyPersonId} TEXT PRIMARY KEY,
                    ${this.#keyCheckIn} BIGINT,
                    ${this.#keyCheckOut} BIGINT,
                    PRIMARY_KEY (${this.#keyPrimary})
                ) `
            )
            .run();
    }

    checkInPerson(personId, timestamp) {
        this.db
            .prepare(
                `INSERT INTO ${this.#tableName}
                (${this.#keyPersonId}, ${this.#keyCheckIn}, ${this.#keyCheckOut})
                VALUES (?, ?, ?)`
            )
            .run(personId, timestamp, this.checkOutDefaultValue);
    }

    checkOutPerson(personId, timestamp) {
        this.db
            .prepare(
                `UPDATE ${this.#tableName}
                SET ${this.#keyCheckOut} = ?
                WHERE ${this.#keyCheckIn} = (
                    SELECT MAX(${this.#keyCheckIn})
                    FROM ${this.#tableName}
                    WHERE ${this.#keyPersonId} = ?
                )`
            )
            .run(timestamp, personId);
    }

    isPersonCheckedIn(personId) {
        const checkOutTimeStamp = this.db
            .prepare(
                `SELECT ${this.#keyCheckOut}
                FROM ${this.#tableName}
                WHERE ${this.#keyCheckIn} = (
                    SELECT MAX(${this.#keyCheckIn})
                    FROM ${this.#tableName}
                    WHERE ${this.#keyPersonId} = ?
                )`
            )
            .get(personId);
        return checkOutTimeStamp === this.checkOutDefaultValue;
    }
}

module.exports = Database;
