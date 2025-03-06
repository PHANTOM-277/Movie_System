const express = require('express');
const mongoose = require('mongoose');
const Movie = require('../schema/movie');
const authenticate = require('../middleware/authenticate');
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

router.post('/admin/new_movie', authenticate(1), async(req,res)=>{
    //this route is only for admin , hence the authenticate(1)
    try{

    }
    catch(e){
        console.log(`Error in adding new movie : ${e}`);
        res.status(500).json({msg:"Server Error"});
    }
});

router.post('/booking/:id', authenticate(0) , async(req,res)=>{
    //this route is for users , admin can book seats too :)
    try{
        //basically try to add the id of the movie into the booking array of user
    }
    catch(e){
        console.log(`Error in booking movie seat : ${e}`);
        res.status(500).json({msg:"Server Error"});
    }
});

module.exports = router;