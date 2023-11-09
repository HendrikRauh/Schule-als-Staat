// Importing required modules
const http = require("http");
const fs = require("fs");
const path = require("path");

const allowedPaths = ["/", "/id-cards/"];

// Creating server
const server = http.createServer(async (req, res) => {
    console.log("url", req.url);

    // ---------------------------------
    // prevent path traversal
    // ---------------------------------

    // prevent null byte attack
    if (req.url.indexOf("/0") !== -1) {
        res.writeHead(403, { "Content-Type": "text/plain" });
        res.end("Access denied");
        return;
    }
    // prevent access of parent folder
    if (!/^[a-z0-9-/]+[\.]?[a-z0-9]*$/.test(req.url)) {
        res.writeHead(403, { "Content-Type": "text/plain" });
        res.end("Access denied");
        return;
    }
    const safeInput = path.normalize(req.url).replace(/^(\.\.(\/|\\|$))+/, "");
    const pathString = path.join(__dirname, safeInput);
    if (pathString.indexOf(__dirname) !== 0) {
        res.writeHead(403, { "Content-Type": "text/plain" });
        res.end("Access denied");
        return;
    }

    // ---------------------------------
    // Handle requests
    // ---------------------------------
    try {
        // Handling .css, .svg and .ico files
        const isCss = pathString.endsWith(".css");
        const isSvg = pathString.endsWith(".svg");
        const isIco = pathString.endsWith(".ico");
        if (isCss || isSvg || isIco) {
            fs.readFile(pathString, "utf8", (err, data) => {
                if (err) {
                    res.writeHead(404, { "Content-Type": "text/plain" });
                    res.end("Not found");
                } else {
                    let contentType = "";
                    if (isCss) {
                        contentType = "text/css";
                    } else if (isSvg) {
                        contentType = "image/svg+xml";
                    } else if(isIco) {
                        contentType = "image/vnd.microsoft.icon";
                    }
                    res.writeHead(200, { "Content-Type": contentType });
                    res.end(data);
                }
            });
        }
        // Handling URLs that are listed in allowedPaths
        else if (allowedPaths.includes(safeInput)) {
            const index = require("." + safeInput + "index");
            const html = await index.getHtml();

            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(html);
        }
        // Handling other URLs
        else {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("404 - Not Found");
        }
    } catch (error) {
        console.error(error);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("An error occurred. Please check the server logs for more details.");
    }
});

// Starting server
server.listen(3000, () => {
    console.log("Server on port 3000!");
});
