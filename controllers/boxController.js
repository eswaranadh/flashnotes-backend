const { db } = require("../utils/admin");

// add cards to box
exports.initializeAllBoxes = function (sessionId) {
    // box 1 will be initialized with all cards
    // box 2 will be empty
    // box 3 will be empty

    const boxesRef = db.collection("boxes").doc(sessionId);

}