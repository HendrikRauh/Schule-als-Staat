const http = require("http");
const Database = require("./database.js");
const fs = require("fs");
const path = require("path");

const db = new Database("DATA.db");

const server = http.createServer((req, res) => {
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
    const data = db.getPerson("Raffael");

    const htmlString = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>Ausweisgenerator</title>
          <link rel="stylesheet" href="style.css"/>
        </head>
        <body>
          <div id="ausweis">
            <div id="title">Schule als Staat</div>
            <div id="content">
              <div id="left">
                <img id="logo" src="mbg-logo-building-only.svg" alt="MBG-LOGO"/>
                <div id="firstName">${data.firstName}</div>
                <div id="lastName">${data.lastName}</div>
              </div>
              <img id="qr" alt="QR-ID"></img>
            </div>
          </div>
        </body>
      </html>
    `;

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(htmlString);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 - Not Found");
  }
});

server.listen(3000, () => {
  console.log("ID-Card on port 3000!");
});
