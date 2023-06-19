const { db } = require("../utils/admin");
const Constants = require("../utils/constants");

// add cards to box
exports.initializeAllBoxes = function (studySetId) {
    // box 1 will be initialized with all cards
    // box 2 will be empty
    // box 3 will be empty

    const boxesRef = db.collection(Constants.BOXES).doc(studySetId);

}