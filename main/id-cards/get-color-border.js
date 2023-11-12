/**
 * This function returns the color that is used to mark the specified role
 * @param {string} role - The role of the person; the role is represented on the id card as colored border
 * @returns the HEX color of the role
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
