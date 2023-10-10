/**
 * This file creates the html for the main website
 */

const BaseHtmlBuilder = require("./base-html-builder");

class MainHtmlBuilder extends BaseHtmlBuilder {
    static content() {
        return `
            <h1>Schule als Staat</h1>
            <div id="nav">
                <a href="/id-cards/">Ausweise</a>
            </div>
        `;
    }
}

module.exports.getHtml = async function () {
    return MainHtmlBuilder.html(
        MainHtmlBuilder.head("Schule als Staat", []),
        MainHtmlBuilder.body(MainHtmlBuilder.content())
    );
};
