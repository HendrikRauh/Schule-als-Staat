// Importing Database module
const Database = require("./database.js");

// Creating a new Database instance
const db = new Database("DATA.db");

// Creating a table in the database
db.createPeopleTable();

// Inserting people into the table
// Each person is defined by their first name, last name, class name, and color code
db.insertPerson("Raffael", "Wolf", "J1", "transparent");
db.insertPerson("Denis", "Ortlieb", "Lehrer", "green");
db.insertPerson("Gerald", "Dietze", "Lehrer", "blue");
db.insertPerson("Hendrik", "Rauh", "J1", "red");

// Logging a success message
console.log("Database created and populated successfully.");