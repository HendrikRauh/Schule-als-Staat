# SalS Main Server
## Current architecture

There are two core concepts used in this server, `POST` requests, used exclusively for API access, and the rest all being routed through the "resource requests" channel in `handleGetRequests` (`server.js`).

### Resource Requests
Resource requests first have all their parameters (URL, ...) validated and then a series of strategies are applied to resolve the request:
- Attempt to check for a valid MIME/file-ending
- - If it's an acceptable resource MIME type, resolve to a file and attempt to send it
- If no file is found, check if the URL is part of allowed template URLs
- Require the template generator, and perform authentication checks
- Generate the final response data and send it.

### API requests
API requests are immediately verified against a list of allowable URLs, then have their respective code file required, and executed. The resolution strategy consists of finding a javascript file in the respective subdirectory called `index` (file ending is implied and left to Node)
