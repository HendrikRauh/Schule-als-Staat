/**
 * This file defines a HtmlBuilder class that can be used to build the html for the website with the id cards.
 * See BaseHtmlBuilder for more information.
 */

const BaseHtmlBuilder = require("../base-html-builder");
const getColor = require("./get-color-border");

/**
 * This class can be used to build the HTML for the id cards website.
 * @see {@link BaseHtmlBuilder} for more information
 */
class IdCardsHtmlBuilder extends BaseHtmlBuilder {
    /**
     * This method returns the path to the favicon.
     * @returns The path from this file to the favicon for the website
     */
    static getFaviconPath() {
        return "../favicon.ico";
    }

    /**
     * This method wraps the HTML of the id cards inside a container and returns the result.
     * @param {string} idCards - the HTML of the id cards
     * @returns the id cards wrapped in a container
     */
    static idCardsContainer(idCards) {
        return `
            <div id="container">
                ${idCards}
            </div>`;
    }

    /**
     * This method builds the HTML for all id cards, which contain the person's data and the QR code and returns it.
     * @param {Array<{firstName: string, lastName: string, className: string, colorCode: string}>} people - An Array of the people that are used to generate the id-cards 
     * @param {Array<object>} qrCodes - An Array of the QR codes of the people
     * @returns The HTML for all id cards as string
     */
    static allIdCards(people, qrCodes) {
        let idCards = "";
        people.forEach((person, index) => {
            idCards += IdCardsHtmlBuilder.idCard(person, qrCodes[index]);
        });
        return idCards;
    }

    /**
     * This method build th HTML for one id card with the person's data and the QR code and returns it.
     * @param {Array<{firstName: string, lastName: string, className: string, colorCode: string}>} person - The person's data
     * @param {Array<object>} qrCode - The QR code of the person
     * @returns A string that contains the id card's HTML
     */
    static idCard(person, qrCode) {
        return `
            <div id="idCard" style="--border-color: ${getColor(person.colorCode)};">
                <div id="title">Schule als Staat</div>
                <div id="content">
                <div id="leftSection">
                    <img id="logo" src="mbg-logo-building.svg" alt="Logo of the MBG"/>
                    <div id="firstName">${person.firstName}</div>
                    <div id="lastName">${person.lastName}</div>
                </div>
                <div id="qrCode">${qrCode}</div>
                </div>
            </div>`;
    }
}

module.exports = IdCardsHtmlBuilder;
