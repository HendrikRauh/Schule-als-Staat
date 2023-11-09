/**
 * This file defines a BaseHtmlBuilder class that can be used to build the head and body of an html website.
 * This class can be extended to add more templates for building html.
 *
 * usage:
 * const html = BaseHtmlBuilder.html(
 *     BaseHtmlBuilder.head("Ausweisgenerator", ["style.css"]),
 *     BaseHtmlBuilder.body("<p>Some HTML</p>")
 * );
 */

class BaseHtmlBuilder {
    static getFaviconPath() {
        return "favicon.ico";
    }

    static html(head, body) {
        return `
            <!DOCTYPE html>
                <html lang="en">
                ${head}
                ${body}
            </html>`;
    }

    static head(title, styleSheets) {
        let head = `
            <head>
                <meta charset="UTF-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                <title>${title}</title>
                <link rel="icon" type="image/x-icon" href="${this.getFaviconPath()}">
                `;

        for (const styleSheet of styleSheets) {
            head += `<link rel="stylesheet" href="${styleSheet}"/>`;
        }
        return (head += `</head>`);
    }

    static body(content) {
        return `
        <body>
            ${content}
        </body>`;
    }
}

module.exports = BaseHtmlBuilder;
