/*
 * This file generates a database, creates a table in it, and populates the table with initial data.
 */

const Database = require("./database.js");

const db = new Database("DATA.db");

db.createPeopleTable();

db.insertPerson("Raffael", "Wolf", "J1", "transparent");
db.insertPerson("Denis", "Ortlieb", "Lehrer", "green");
db.insertPerson("Gerald", "Dietze", "Lehrer", "blue");
db.insertPerson("Hendrik", "Rauh", "J1", "red");

console.log("Database created and populated successfully.");
