/**
 * This file defines a HtmlBuilder class that can be used to build the html for the website with the id cards
 * 
 * usage:
    const html = HtmlBuilder.html(
        HtmlBuilder.head("Ausweisgenerator", ["style.css"]),
        HtmlBuilder.body(
          HtmlBuilder.idCardsContainer(HtmlBuilder.allIdCards(people, qrCodes))
        )
      );
 */

const getColor = require("./get-color-border.js");

class HtmlBuilder {
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
        <title>${title}</title>`;

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

  static idCardsContainer(idCards) {
    return `
    <div id="container">
      ${idCards}
    </div>`;
  }

  static allIdCards(people, qrCodes) {
    let idCards = "";
    people.forEach((person, index) => {
      idCards += HtmlBuilder.idCard(person, qrCodes[index]);
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

module.exports = HtmlBuilder;
