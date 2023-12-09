/**
 * This class can be used to build the HTML of a website.
 * Extend this class to add more templates for building HTML.
 *
 * Usage:
 * ```
 * const html = BaseHtmlBuilder.html(
 *     BaseHtmlBuilder.head("Title", ["style.css"]),
 *     BaseHtmlBuilder.body("<p>Some HTML</p>")
 * );
 * ```
 */
class BaseHtmlBuilder {
    /**
     * This method returns the path to the favicon. Remember to override this method when inheriting from this class.
     * @returns The path from this file to the favicon for the website
     */
    static getFaviconPath() {
        return "favicon.ico";
    }

    /**
     * This methods builds an HTML document from the head and the body and returns it
     * @param {string} head - The HTML for the head of the website
     * @param {string} body - The HTML for the body of the website
     * @returns An HTML document that contains the specified head and body
     */
    static html(head, body) {
        return `
            <!DOCTYPE html>
                <html lang="de">
                ${head}
                ${body}
            </html>`;
    }

    /**
     * This methods builds an HTML head that contains the specified title and the stylesheets and returns it
     * @param {string} title - The title for the website. It is shown at tabs.
     * @param {Array<string>} styleSheets - A array of stylesheets for the website
     * @param {string} other - Other HTML that belongs in the head
     * @returns A string that contains a default HTML head
     */
    static head(title, styleSheets, other = "") {
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
        head += other
        return (head += `</head>`);
    }

    /**
     * This method wraps the specified content inside a body tag and returns it
     * @param {string} content The HTML that should be inside of the body
     * @returns The string that contains a HTML containing the content
     */
    static body(content) {
        return `
        <body>
            ${content}
        </body>`;
    }
}

module.exports = BaseHtmlBuilder;
