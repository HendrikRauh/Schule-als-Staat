const Database = require("../database");
const attendanceTable = Database("DATA.db").Attendance;

/**
 * Changes the attendance status of a person based on the current attendance of the person.
 * If the person is currently checked in, the person will be checked out else the person will be checked in.
 * @param {string} id - the id of the person
 * @param {number} timestamp - the time stamp that should be used for the check-in/check-out time in the database
 * @returns if the person gets check out, the time that the person was attendant else `-1`
 */
function changeAttendance(id, timestamp) {
    if (attendanceTable.isPersonCheckedIn(id)) {
        attendanceTable.checkOutPerson(id, timestamp);
        return attendanceTable.getLastAttendanceDuration(id);
    } else {
        attendanceTable.checkInPerson(id, timestamp);
        return -1;
    }
}

module.exports = changeAttendance;
