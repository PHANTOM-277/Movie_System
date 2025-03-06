const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    email : {
        type: String,
        required : true,
        unique : true,
        index : true
    },
    timeStamp : {
        type: Date,
        required : true
    },
    sessionId : {
        type: String,
        required : true,
        index : true,
        unique : true
    },
    expiresAt : {
        type: Date,
    }
});

const Session = mongoose.model('session', sessionSchema);

module.exports = Session;