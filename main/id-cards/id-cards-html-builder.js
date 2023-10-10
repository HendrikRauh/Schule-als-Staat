/**
 * This file defines a HtmlBuilder class that can be used to build the html for the website with the id cards.
 * See BaseHtmlBuilder for more information.
 */

const BaseHtmlBuilder = require("../base-html-builder");
const getColor = require("./get-color-border");

class IdCardsHtmlBuilder extends BaseHtmlBuilder {
    static idCardsContainer(idCards) {
        return `
            <div id="container">
                ${idCards}
            </div>`;
    }

    static allIdCards(people, qrCodes) {
        let idCards = "";
        people.forEach((person, index) => {
            idCards += IdCardsHtmlBuilder.idCard(person, qrCodes[index]);
        });
        return idCards;
    }

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
