/**
 * This file contains a function that can be used to read the content of a CSV-file which contains the data of the students.
 */

const fs = require("fs");
const csv = require("fast-csv");

function readCsvFile(filePath, onFinished) {
    const people = [];
    let currentClass = "";

    fs.createReadStream(filePath)
        .pipe(csv.parse({ headers: false, delimiter: ";", trim: true }))
        .on("error", (error) => console.warn("Error occured while parsing csv: " + error))
        .on("data", (data) => {
            // if the first column contains only digits, the row contains a student
            if (/^\d+$/.test(data[0])) {
                const names = data[1].split(",");
                people.push({
                    firstName: names[1].trim(),
                    lastName: names[0].trim(),
                    className: currentClass,
                });
            } else if (data[0] !== "Insgesamt:") {
                currentClass = data[0].trim();
            }
        })
        .on("end", () => {
            console.log("finished reading csv");
            // people.forEach((person) => console.log(JSON.stringify(person)));
            console.log("size: " + people.length);
            onFinished(people);
        });
}

module.exports = readCsvFile;
