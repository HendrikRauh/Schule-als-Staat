/**
 * This file creates and fills the html for the id cards with data
 */

const Database = require("./../database.js");
const QRCode = require("qrcode");
const IdCardsHtmlBuilder = require("./id-cards-html-builder.js");

// Initializing database
const peopleTable = new Database("DATA.db").People;

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
