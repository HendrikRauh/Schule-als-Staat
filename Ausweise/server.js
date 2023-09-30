const http = require("http");
const Database = require("./database.js");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");

const db = new Database("DATA.db");

const server = http.createServer(async (req, res) => {
  try {
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
    } else if (req.url.endsWith(".svg")) {
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
    } else if (req.url === "/") {
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
      `;
    
      const qrCodes = await Promise.all(people.map(person => QRCode.toDataURL(person.id)));

      for (let i = 0; i < people.length; i++) {
        const person = people[i];
        const qrCode = qrCodes[i];
        htmlString += `
          <div id="ausweis" style="--border-color: ${person.colorCode};">
            <div id="title">Schule als Staat</div>
            <div id="content">
              <div id="left">
                <img id="logo" src="mbg-logo-building-only.svg" alt="MBG-LOGO"/>
                <div id="firstName">${person.firstName}</div>
                <div id="lastName">${person.lastName}</div>
              </div>
              <img id="qr" src="${qrCode}" alt="QR-ID"></img>
            </div>
          </div>
        `;
      }
    
      htmlString += `
            </body>
          </html>
      `;
    
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(htmlString);
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 - Not Found");
    }
  } catch (error) {
    console.error(error);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("An error occurred. Please check the server logs for more details.");
  }
});

server.listen(3000, () => {
  console.log("ID-Card on port 3000!");
});