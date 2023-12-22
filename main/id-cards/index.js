const Database = require("./../database.js");
const QRCode = require("qrcode");
const IdCardsHtmlBuilder = require("./id-cards-html-builder.js");

// @todo: reorganise and refactor maybe?
// Initializing database
const db = new Database("DATA.db");
const peopleTable = db.People;
const adminTable = db.Admins;


// @todo: consider passing along authentication details (for eg. "Welcome LASTNAME, NAME")
/**
 * This function creates and fills the HTML with data for the id cards website by using the {@link IdCardsHtmlBuilder}.
 * @returns A function that builds the HTML for the id cards website
 */
module.exports.getHtml = async function () {
    const people = peopleTable.getAllPeople();

    const qrCodes = await Promise.all(
        people.map((person) =>
            QRCode.toString(
                `${person.firstName},${person.lastName},${person.className},${person.id}`,
                {
                    type: "svg",
                    color: {
                        light: "#0000", // Transparent background
                    },
                    margin: 0, // No padding
                    errorCorrectionLevel: "Q",
                }
            )
        )
    );

    const html = IdCardsHtmlBuilder.html(
        IdCardsHtmlBuilder.head("Ausweisgenerator", ["style.css"]),
        IdCardsHtmlBuilder.body(
            IdCardsHtmlBuilder.idCardsContainer(IdCardsHtmlBuilder.allIdCards(people, qrCodes))
        )
    );

    return html;
};

/**
 * This method is responsible for checking authentication credentials.
 * If it is not present, the server assumes this templated HTML site is accessible without authentication.
 * @param username The username provided by the browser
 * @param password The password provided by the browser
 * @return Whether the credentials were accepted or not
 */
module.exports.authenticate = async function(username, password) {
    return adminTable.verifyAdmin(username, password);
}
