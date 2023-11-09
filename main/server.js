// Importing required modules
const http = require("http");
const fs = require("fs");
const path = require("path");

// remember to escape backslashes in paths
const allowedPaths = ["", "id-cards\\"];

// Creating server
const server = http.createServer(async (req, res) => {

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
    const safeUrl = path.normalize(req.url).replace(/^(\.\.(\/|\\|$))+/, "").substring(1);
    const pathString = path.join(__dirname, safeUrl);
    if (pathString.indexOf(__dirname) !== 0) {
        res.writeHead(403, { "Content-Type": "text/plain" });
        res.end("Access denied");
        return;
    }

    console.log(`safeUrl: '${safeUrl}'`);

    // ---------------------------------
    // Handle requests
    // ---------------------------------
    try {
        // Handling .css, .svg and .ico files
        const isCss = safeUrl.endsWith(".css");
        const isIco = safeUrl.endsWith(".ico");
        const isSvg = safeUrl.endsWith(".svg");
        if (isCss || isSvg || isIco) {
            fs.readFile(safeUrl, (err, data) => {
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
                        contentType = "image/x-icon";
                    }
                    res.writeHead(200, { "Content-Type": contentType });
                    res.end(data);
                }
            });
        }
        // Handling URLs that are listed in allowedPaths
        else if (allowedPaths.includes(safeUrl)) {
            const index = require(".\\" + safeUrl + "index");
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
