const mongoose = require('mongoose');

const user = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    bookings:[{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    }]
});

module.exports = mongoose.model('users',user);