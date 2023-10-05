// Importing required modules
const http = require("http");
const Database = require("./database.js");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");

// Initializing database
const db = new Database("DATA.db");

// Creating server
const server = http.createServer(async (req, res) => {
  try {
    // Handling CSS files
    if (req.url.endsWith(".css")) {
      const cssPath = path.join(__dirname, req.url);
      fs.readFile(cssPath, "utf8", (err, data) => {
        if (err) {
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("Not Found");
        } else {
          res.writeHead(200, { "Content-Type": "text/css" });
          res.end(data);
        }
      });
    }
    // Handling SVG files
    else if (req.url.endsWith(".svg")) {
      const svgPath = path.join(__dirname, req.url);
      fs.readFile(svgPath, "utf8", (err, data) => {
        if (err) {
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("Not Found");
        } else {
          res.writeHead(200, { "Content-Type": "image/svg+xml" });
          res.end(data);
        }
      });
    }
    // Handling root URL
    else if (req.url === "/") {
      const people = db.getAllPeople();
      let htmlString = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <title>Ausweisgenerator</title>
            <link rel="stylesheet" href="style.css"/>
          </head>
          <body>
          <div id="container">
      `;

      const qrCodes = await Promise.all(
        people.map((person) =>
          QRCode.toString(person.id, {
            type: "svg",
            color: {
              light: "#0000", // Transparent background
            },
            margin: 0, // No padding
            errorCorrectionLevel: "Q",
          })
        )
      );

      for (let i = 0; i < people.length; i++) {
        const person = people[i];
        const qrCode = qrCodes[i];
        htmlString += `
          <div id="idCard" style="--border-color: ${person.colorCode};">
            <div id="title">Schule als Staat</div>
            <div id="content">
              <div id="leftSection">
                <img id="logo" src="mbgLogoBuilding.svg" alt="Logo of the MBG"/>
                <div id="firstName">${person.firstName}</div>
                <div id="lastName">${person.lastName}</div>
              </div>
              <div id="qrCode">${qrCode}</div>
            </div>
          </div>
        `;
      }

      htmlString += `
              </div>
            </body>
          </html>
      `;

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(htmlString);
    }
    // Handling other URLs
    else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 - Not Found");
    }
  } catch (error) {
    console.error(error);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end(
      "An error occurred. Please check the server logs for more details."
    );
  }
});

// Starting server
server.listen(3000, () => {
  console.log("ID-Card on port 3000!");
});