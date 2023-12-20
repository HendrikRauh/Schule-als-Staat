/*
 * This file generates a database, creates a table in it, and populates the table with initial data.
 */

const Database = require("./database.js");
const db = new Database("DATA.db");

const peopleTable = db.People;
const adminTable = db.Admins;

async function main() {
    peopleTable.createPeopleTable();
    adminTable.createAdminTable();

    peopleTable.insertPerson("Raffael", "Wolf", "J1", "");
    peopleTable.insertPerson("Denis", "Ortlieb", "Lehrer", "LEITUNG");
    let admin = peopleTable.insertPerson("Hendrik", "Rauh", "J1", "ERSTHELFER");
    peopleTable.insertPerson("Alexander", "Becher", "BKZ", "EXTERN");

    await adminTable.insertAdmin("hendrik", "test2323", admin)

    console.log("Database created and populated successfully.");

}
main();
