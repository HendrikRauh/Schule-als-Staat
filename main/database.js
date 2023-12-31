/**
 * This file defines a Database class which holds the different tables of the database.
 * Tables:
 * - People: contains methods for creating a people table,
 *           inserting a person into the table,
 *           getting a person by first name,
 *           and getting all people from the table.
 *
 * - Attendance: contains methods for creating a attendance table,
 *               checking an person in and out by their Id,
 *               and retrieve by Id whether a person is checked in.
 *
 * - Admins: contains methods for creating the admin table,
 *           finding them by their name, and verifying login
 */

const sqlite3 = require("better-sqlite3");
const generateHash = require("./id-cards/hashing");
const fs = require("fs");
const argon = require("argon2");

const salt = fs.readFileSync("salt.key", "utf8").trim();

/**
 * This class creates Database with the tables for people and attendance.
 * @param {string} databaseName - the name of the database file
 */
class Database {
    constructor(databaseName) {
        this.db = new sqlite3(databaseName);

        this.People = new TablePeople(this.db);
        this.Attendance = new TableAttendance(this.db);
        this.Admins = new TableAdmins(this.db);
    }
}

// @todo: admin table is cursed
/**
 * This class represents the table `admins`.
 * Columns: `id` | `authName` | `argonPass` | `personId`
 */
class TableAdmins {
    constructor(database) {
        this.db = database;
    }

    /**
     * Create the table if it doesn't exist already.
     */
    createAdminTable() {
        this.db
            .prepare(
                "CREATE TABLE IF NOT EXISTS admins (id INTEGER PRIMARY KEY AUTOINCREMENT, authName TEXT, argonPass TEXT, personId TEXT)" /* No foreign key constraint because I'm not ready to fight SQLite */
            )
            .run();
    }

    /**
     * Asynchronous method that creates a new admin account.
     * Has to be linked to an entry in the people table
     * @param username Username
     * @param password Their password
     * @param person The ID of their affiliated person entry
     */
    async insertAdmin(username, password, person) {
        let crypt = await argon.hash(password);
        this.db
            .prepare(
                `INSERT OR REPLACE INTO admins (authName, argonPass, personId) VALUES (?, ?, ?)`
            )
            .run(username, crypt, person);
    }

    async verifyAdmin(username, password) {
        const stmt = this.db.prepare("SELECT argonPass FROM admins WHERE authName = ?");
        const admin = stmt.get(username);
        if(admin == null)
            return false;
        return argon.verify(admin.argonPass, password);
    }
}


/**
 * This class represents the table `people`.
 * Columns: `id` | `firstName` | `lastName` | `className` | `colorCode`
 */
class TablePeople {
    constructor(database) {
        this.db = database;
    }

    /**
     * This method creates the sql table it it does not exists.
     */
    createPeopleTable() {
        this.db
            .prepare(
                "CREATE TABLE IF NOT EXISTS people (id TEXT PRIMARY KEY, firstName TEXT, lastName TEXT, className TEXT, colorCode TEXT)"
            )
            .run();
    }

    /**
     * This method generates the id for the person and inserts the person into the database.
     * @param {string} firstName - The first name of the person that should be inserted in the table
     * @param {string} lastName - The last name of the person
     * @param {string} className - The class that the person belongs to
     * @param {string} colorCode - The person's role which will be represented by a colored border on the id card;
     *                             one of the values: `LEITUNG`, `ERSTHELFER`, `EXTERN`; can be empty
     * @return Returns generated ID associated with database entry.
     */
    insertPerson(firstName, lastName, className, colorCode) {
        const id = generateHash(`${firstName}${salt}${lastName}${salt}${className}`);
        this.db
            .prepare(
                `INSERT OR REPLACE INTO people (id, firstName, lastName, className, colorCode) VALUES (?, ?, ?, ?, ?)`
            )
            .run(id, firstName, lastName, className, colorCode);
        return id;
    }

    /**
     * This method returns the first person in the database with the specified first name.
     * To access the attributes of the person use the name of the columns (see {@link TablePeople} for the column names)
     * @param {string} firstName - The first name of the person
     * @returns the first person that is found in the database as an object
     */
    getPerson(firstName) {
        const stmt = this.db.prepare("SELECT * FROM people WHERE firstName = ?");
        const person = stmt.get(firstName);
        return person;
    }

    /**
     * This method returns an array of all people that are in the database
     * To access the attributes of the person use the name of the columns (see {@link TablePeople} for the column names)
     * @returns An array of all people
     */
    getAllPeople() {
        const stmt = this.db.prepare("SELECT * FROM people");
        const people = stmt.all();
        return people;
    }
}

/**
 * This class represents the table `attendance`.
 * Columns: `id` | `firstName` | `lastName` | `className` | `colorCode`
 */
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

        this.#tableName = "attendance";
        this.#keyPrimary = "id";
        this.#keyPersonId = "personId";
        this.#keyCheckIn = "checkIn";
        this.#keyCheckOut = "checkOut";
    }

    /**
     * This method creates the sql table it it does not exists.
     */
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

    /**
     * This methods finds the most recent check-in time of the person with the specified id
     * @param {string} personId - The id of the person
     * @returns the most recent check-in time as unix timestamp in milliseconds
     */
    getLatestCheckInTime(personId) {
        return this.db
            .prepare(
                `SELECT MAX(${this.#keyCheckIn})
                FROM ${this.#tableName}
                WHERE ${this.#keyPersonId} = ?`
            )
            .run(personId);
    }

    /**
     * This method checks in a person with the specified id at the specified timestamp
     * @param {string} personId - The id of the person
     * @param {number} timestamp - The time as unix timestamp in milliseconds when the person is checking in
     */
    checkInPerson(personId, timestamp) {
        this.db
            .prepare(
                `INSERT INTO ${this.#tableName}
                (${this.#keyPersonId}, ${this.#keyCheckIn}, ${this.#keyCheckOut})
                VALUES (?, ?, ?)`
            )
            .run(personId, timestamp, this.checkOutDefaultValue);
    }

    /**
     * This method checks out a person with the specified id at the specified timestamp
     * @param {string} personId - The id of the person
     * @param {number} timestamp - The time as unix timestamp in milliseconds when the person is checking out
     */
    checkOutPerson(personId, timestamp) {
        this.db
            .prepare(
                `UPDATE ${this.#tableName}
                SET ${this.#keyCheckOut} = ?
                WHERE ${this.#keyCheckIn} = ?`
            )
            .run(timestamp, this.getLatestCheckInTime(personId));
    }

    /**
     * This method checks if the person is currently checked in or checked out and returns the result
     * @param {string} personId - The id of the person
     * @returns `true` if the person is checked in, `false` otherwise
     */
    isPersonCheckedIn(personId) {
        const checkOutTimeStamp = this.db
            .prepare(
                `SELECT ${this.#keyCheckOut}
                FROM ${this.#tableName}
                WHERE ${this.#keyCheckIn} = ?`
            )
            .get(this.getLatestCheckInTime(personId));
        return checkOutTimeStamp === this.checkOutDefaultValue;
    }

    /**
     * This method returns how long the person was attendant the last time the person was checked in
     * @param {string} personId - The id of the person
     * @returns - How long the person was attendant the last time or `-1` if the person is currently checked in
     */
    getLatestAttendanceDuration(personId) {
        if (this.isPersonCheckedIn(personId)) {
            return -1;
        }

        const timestamps = this.db
            .prepare(
                `SELECT ${this.#keyCheckIn}, ${this.#keyCheckOut}
                FROM ${this.#tableName}
                WHERE ${this.#keyPersonId} = ? AND ${this.#keyCheckIn} = ?`
            )
            .get(personId, this.getLatestCheckInTime(personId));

        return timestamps.checkOut - timestamps.checkIn;
    }
}

module.exports = Database;
