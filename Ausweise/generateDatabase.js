const Database = require("./database.js");

const db = new Database("DATA.db");
db.createPeopleTable();
db.insertPerson("Hendrik", "Rauh", "J1", "red");
db.insertPerson("Raffael", "Wolf", "J1", "transparent");
db.insertPerson("Sarah", "Krautter", "J2", "blue");

console.log("Database created and populated successfully.");