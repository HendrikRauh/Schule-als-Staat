/**
 * This file can be called from the command line to read the students from a CSV file
 * and insert them into the database.
 * The file name must be passed as an argument to the node.js file.
 * If the id is already present in the database the student will NOT be inserted a second time.
 *
 * Note:
 * The student's first name, last name and class are taken from the CSV file.
 * The color code is not included in the CSV file,
 * thus the color code will be automatically set to an emtpy string (-> transparent border on the id card)
 *
 * Usage (command line):
 * node populate-db-from-csv.js mbg_schuelerliste.CSV
 *                              ---------------------  csv file name
 */

const fs = require("fs");
const path = require("path");
const readCsv = require("./read-csv.js");
const Database = require("./database.js");

// get command line arguments
const filePath = process.argv[2];
if (filePath === undefined) {
    console.log("\nError:\nPlease pass the path to the CSV file as an argument.\n");
    process.exit(1);
}
const joinedPath = path.join("./", filePath);
if (!fs.existsSync(joinedPath)) {
    console.log("\nError:\nFile was not found! Make sure that the path is correct.\n");
    process.exit(1);
}

readCsv(joinedPath, (people) => {
    console.log("inserting people into the database...");
    insertIntoDb(people);
    console.log("Successfully populated database\n");
});

function insertIntoDb(people) {
    const peopleTable = new Database("DATA.db").People;
    peopleTable.createPeopleTable();

    people.forEach((person) => {
        peopleTable.insertPerson(person.firstName, person.lastName, person.className, "");
    });
}
