const express = require('express');
const mongoose = require('mongoose');
const Movie = require('../schema/movie');
const router = express.Router();

router.get('/info', async(req,res)=>{
    try{
        const movies = Movie.find({date:{$gte:new Date()}});
        if(movies.length === 0 || !movies){
            //if no movies are scheduled
            return res.status(404).json({msg:"No movies scheduled"});
        }
        //send all movies
        return res.status(200).json({movies:movies});
    }
    catch(e){
        console.log(`Error in displaying available movies : ${e}`);
        res.status(500).json({msg:"Server Error"});
    }
});

module.exports = router;