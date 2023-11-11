const Database = require("./../database.js");
const QRCode = require("qrcode");
const IdCardsHtmlBuilder = require("./id-cards-html-builder.js");

// Initializing database
const peopleTable = new Database("DATA.db").People;

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
