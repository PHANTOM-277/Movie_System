const mongoose = require('mongoose');

const user = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true,
        index:true
    },
    password:{
        type:String,
        required:true
    },
    isAdmin:{
        type:Boolean,
        required:true
    },
    bookings:[{
        nseats:{
            type:Number,
            required:true
        },
        movie: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'movies', // Reference to the Movie collection
            required: true
        },
        booked_at:{
            type: Date,
            required: true
        }
    }]
});

module.exports = mongoose.model('users',user);