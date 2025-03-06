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
        //read data from body
        return res.status(201).json({msg:"done"});
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

router.delete('/admin/delete_movie/:id', authenticate(1), async(req,res)=>{
    //allow an admin to delete a movie
})

router.put('/admin/change_seats/:id', authenticate(1), async(req,res)=>{
    //allows changing of seats. But if seats given by admin < how many are booked , then not allowed.
})

router.get('/user_bookings', authenticate(0), async(req,res)=>{
    try{
        //basically show the array of bookings , here we will need aggregation maybe
    }
    catch(e){

    }
})

module.exports = router;