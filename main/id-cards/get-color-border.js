/*
 * This file contains a function to return a color based on a given role.
 */

function getColor(role) {
    switch (role) {
        case "ERSTHELFER":
            return "#d60000";
        case "EXTERN":
            return "#8734a8";
        case "LEITUNG":
            return "#009402";
        default:
            return "transparent";
    }
}

module.exports = getColor;
