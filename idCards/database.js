// Importing required modules
const sqlite3 = require("better-sqlite3");
const generateMD5Hash = require("./hashing"); // Importing the function from hashing.js

// Database class
class Database {
  // Constructor to initialize database
  constructor(databaseName) {
    this.db = new sqlite3(databaseName);
  }

  // Function to create people table
  createPeopleTable() {
    this.db
      .prepare(
        "CREATE TABLE IF NOT EXISTS people (id TEXT PRIMARY KEY, firstName TEXT, lastName TEXT, className TEXT, colorCode INTEGER)"
      )
      .run();
  }

  // Function to insert person into the table
  insertPerson(firstName, lastName, className, colorCode) {
    const id = generateMD5Hash(firstName + lastName);
    this.db
      .prepare(
        `INSERT OR REPLACE INTO people (id, firstName, lastName, className, colorCode) VALUES (?, ?, ?, ?, ?)`
      )
      .run(id, firstName, lastName, className, colorCode);
  }

  // Function to get a person by first name
  getPerson(firstName) {
    const stmt = this.db.prepare("SELECT * FROM people WHERE firstName = ?");
    const person = stmt.get(firstName);
    return person;
  }

  // Function to get all people from the table
  getAllPeople() {
    const stmt = this.db.prepare("SELECT * FROM people");
    const people = stmt.all();
    return people;
  }
}

// Exporting Database class
module.exports = Database;