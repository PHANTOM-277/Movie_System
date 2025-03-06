const mongoose = require('mongoose');

const movie = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true,
        index:true
    },
    date:{
        type:Date,
        required:true
    },
    capacity:{
        type:Number,
        required:true
    },
    seatsbooked:{
        type:Number,
        required:true
    }
});

module.exports = mongoose.model('movies', movie);