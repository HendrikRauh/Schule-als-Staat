/**
 * This file contains a function that can be used to read the content of a CSV file
 * which contains the data of the students.
 * 
 * Call readCsvFile with the path of the CSV file and a callback
 * that will be invoked when the content of the file is read completely.
 * The list of students is passed to the callback function.
 */

const fs = require("fs");
const csv = require("fast-csv");


/**
 * This function reads the content of a CSV file and parses it to a list of people 
 * @param {string} filePath - The path to your CSV file
 * @param {readCsvFinishedCallback} onFinished - A callback that is invoked when the content of the file is read and processed completely
 */
function readCsvFile(filePath, onFinished) {
    const people = [];
    let currentClass = "";

    fs.createReadStream(filePath)
        .pipe(csv.parse({ headers: false, delimiter: ";", trim: true }))
        .on("error", (error) => console.warn("Error occurred while parsing csv: " + error))
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

/**
 * This callback is invoked when the content of the file is read and processed completely
 * @callback readCsvFinishedCallback
 * @param {Array<{firstName: string, lastName: string, className: string}>} people - An array of the people that are read from the csv file
 */

module.exports = readCsvFile;
