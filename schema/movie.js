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
    },
    base_price:{
        type:Number,
        required:true
    },
    current_price:{
        type:Number,
        required:true
    },
    status:{
        type:String,
        required:true
    }
});

module.exports = mongoose.model('movies', movie);