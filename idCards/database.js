/*
* This file defines a Database class with methods for creating a people table, 
* inserting a person into the table, getting a person by first name, and getting all people from the table.
*/

const sqlite3 = require("better-sqlite3");
const generateMD5Hash = require("./hashing");

class Database {
  constructor(databaseName) {
    this.db = new sqlite3(databaseName);
  }

  createPeopleTable() {
    this.db
      .prepare(
        "CREATE TABLE IF NOT EXISTS people (id TEXT PRIMARY KEY, firstName TEXT, lastName TEXT, className TEXT, colorCode INTEGER)"
      )
      .run();
  }

  insertPerson(firstName, lastName, className, colorCode) {
    const id = generateMD5Hash(firstName + lastName);
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

module.exports = Database;
