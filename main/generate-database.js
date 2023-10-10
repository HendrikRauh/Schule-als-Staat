/*
 * This file generates a database, creates a table in it, and populates the table with initial data.
 */

const Database = require("./database.js");

const db = new Database("DATA.db");

db.createPeopleTable();

db.insertPerson("Raffael", "Wolf", "J1", "");
db.insertPerson("Denis", "Ortlieb", "Lehrer", "LEITUNG");
db.insertPerson("Hendrik", "Rauh", "J1", "ERSTHELFER");
db.insertPerson("Alexander", "Becher", "BKZ", "EXTERN");

console.log("Database created and populated successfully.");
