// Importing required modules
const http = require("http");
const fs = require("fs");
const path = require("path");
const queryString = require("querystring");

// remember to escape backslashes in paths
const allowedPaths = ["", "id-cards\\"];

// allowed file type + MIME type
const allowedFileTypes = new Map([
    [".css", "text/css"],
    [".svg", "image/svg+xml"],
    [".ico", "image/x-icon"],
]);

// JavaScript files that are APIs and are allowed to be reached from outside
const validApiList = ["attendance\\change-attendance"];

// Creating server
const server = http.createServer(async (req, res) => {
    let result = checkUrl(req.url);
    if (!result.isUrlSafe) {
        res.writeHead(403, { "Content-Type": "text/plain" });
        res.end("Access denied");
        return;
    }

    const safeUrl = result.safeUrl;
    const pathString = result.pathString;
    console.log(`safeUrl: '${safeUrl}'`);

    // ---------------------------------
    // Handle requests
    // ---------------------------------
    try {
        if (req.method === "POST") {
            handlePostRequests(safeUrl, req, res);
        } else {
            handleGetRequests(safeUrl, pathString, res);
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

/**
 * This function handles GET requests and responds with resource files that are listed
 * in `allowedFileTypes` or HTML websites which are listed in `allowedPaths`.
 * @param {string} safeUrl - The requested url which has to be checked for attacks
 * @param {http.ServerResponse} res - The response of the GET request
 */
async function handleGetRequests(safeUrl, pathString, res) {
    // Handling resource files that are specified in allowedFileTypes
    const key = [...allowedFileTypes.keys()].find((fileType) => {
        return pathString.endsWith(fileType);
    });
    if (key) {
        fs.readFile(pathString, (err, data) => {
            if (err) {
                res.writeHead(404, { "Content-Type": "text/plain" });
                res.end("Not found");
            } else {
                const contentType = allowedFileTypes.get(key);
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
}

/**
 * This function handles POST requests and responds by running the requested script which must be contained in `validApiList` and using this result as respond.
 * The respond is a JSON string which includes the field `result`, the result of the executed script.
 * @param {string} safeUrl - The requested url which has to be checked for attacks
 * @param {http.IncomingMessage} req - The POST request
 * @param {http.ServerResponse} res - The response of the POST request
 */
function handlePostRequests(safeUrl, req, res) {
    let body = "";
    req.on("data", (data) => {
        body += data;
        console.log("partial body:", body);
    });
    req.on("end", () => {
        console.log("body:", body);
        const post = queryString.parse(body);
        console.log("post:", post);

        if (validApiList.contains(safeUrl)) {
            const method = require("./" + safeUrl);
            const result = JSON.stringify({ result: method() });
            res.writeHead(200, "application/json");
            res.end(result);
        } else {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("404 - The requested URL was not found");
        }
    });
}

/**
 * This function checks if the url is safe, so there is no null byte attack or the url accesses the parent folder of the server.
 * @param {string} url - The URL that should be checked for attacks
 * @returns An `object` containing the boolean `isUrlSafe` which
 * states whether the url is safe and the string `safeUrl` which is the
 * safe URL or null if the url is not safe
 */
function checkUrl(url) {
    // prevent path traversal

    let resultNotSafe = {
        isUrlSafe: false,
        safeUrl: null,
        pathString: null,
    };

    // prevent null byte attack
    if (url.indexOf("/0") !== -1) {
        return resultNotSafe;
    }
    // prevent access of parent folder
    if (!/^[a-z0-9-/]+[\.]?[a-z0-9]*$/.test(url)) {
        return resultNotSafe;
    }

    const safeUrl = path.normalize(url).replace(/^(\.\.(\/|\\|$))+/, "");
    const pathString = path.join(__dirname, safeUrl);
    if (pathString.indexOf(__dirname) !== 0) {
        return resultNotSafe;
    }

    return {
        isUrlSafe: true,
        safeUrl: safeUrl.substring(1), // remove leading slash
        pathString: pathString,
    };
}
