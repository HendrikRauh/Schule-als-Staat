/*
 * This file generates a database, creates a table in it, and populates the table with initial data.
 */

const Database = require("./database.js");

const peopleTable = new Database("DATA.db").People;

peopleTable.createPeopleTable();

peopleTable.insertPerson("Raffael", "Wolf", "J1", "");
peopleTable.insertPerson("Denis", "Ortlieb", "Lehrer", "LEITUNG");
peopleTable.insertPerson("Hendrik", "Rauh", "J1", "ERSTHELFER");
peopleTable.insertPerson("Alexander", "Becher", "BKZ", "EXTERN");

console.log("Database created and populated successfully.");
