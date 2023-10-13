/**
 * This file can be called from command line to read the students from a CSV file and insert them into the database.
 * The file name must be passed as an argument to the file.
 * 
 * Usage:
 * node populate-db-from-csv.js mbg_schuelerliste.CSV
 *                              ---------------------  file name
 */

const path = require("path");
const readCsv = require("./read-csv.js");
const Database = require("./database.js");

// get command line arguments
const filePath = process.argv[2];
const joinedPath = path.join("./", filePath);

try {
    readCsv(joinedPath, (people) => {
        insertIntoDb(people);
    });
} catch(err) {
    console.log("File was not found! Make sure that you passed the file path as an argument and the path is correct.")
}

function insertIntoDb(people) {
    const peopleTable = new Database("DATA.db").People;
    peopleTable.createPeopleTable();
    
    people.forEach((person) => {
        peopleTable.insertPerson(person.firstName, person.lastName, person.className, "");
    });
    
    console.log("successfully populated database");
}