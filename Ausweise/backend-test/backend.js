const http = require("http");
const Database = require("./database.js");

const db = new Database("DATA.db");

const server = http.createServer((req, res) => {
  if (req.url === "/") {
    // Fetch data from your database
    const data = db.getPerson("Raffael"); // You need to implement this method

    // Generate your HTML string with the data
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
                <img id="logo" src="../resource/mbg-logo-building-only.svg" alt="MBG-LOGO"/>
                <div id="firstName">${data.firstName}</div>
                <div id="lastName">${data.lastName}</div>
              </div>
              <img id="qr" alt="QR-ID"></img>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send the generated HTML to the client
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(htmlString);
  }
});

server.listen(3000, () => {
  console.log("Server is listening on port 3000!");
});
