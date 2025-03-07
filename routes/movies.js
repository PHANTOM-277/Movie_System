const express = require('express');
const mongoose = require('mongoose');
const Movie = require('../schema/movie');
const authenticate = require('../middleware/authenticate');
const router = express.Router();

router.get('/info', async(req,res)=>{
    try{
        const movies = await Movie.find({date:{$gte:new Date()}});
        if(movies.length === 0){
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
        const { movie_name , movie_date , movie_capacity, movie_base_price } = req.body;
        if(!movie_name || !movie_date || !movie_capacity || !movie_base_price){
            //not enough information
            return res.status(400).json({msg:"Missing Information , please give movie name, date, capacity and base price."});
        }
        const parsed_movie_date = new Date(movie_date);//parse the date given into Date object
        if (isNaN(parsedDate.getTime())){
            //if invalid date
            return res.status(400).json({ msg: "Invalid date format." });
        }
        if (movie_date < new Date()){
            //if this movie date is before now
            return res.status(400).json({ msg: "Movie date must be after current date." });
        }
        if(movie_capacity<= 0){
            //invalid capacity
            return res.status(400).json({msg:"Movie capacity should be more than 0."});
        }
        if(movie_base_price <= 0){
            //invalid base price
            return res.status(400).json({msg:"Movie base price should be more than 0."});
        }
        if(await Movie.findOne({name:movie_name})){
            //if a movie with this name alreay exists , dont create new one
            return res.status(400).json({msg:"A movie with this name already exists."})
        }
        //if we have reached here , we can create the movie document
        const movie = new Movie({
            name:movie_name,
            date:parsed_movie_date,
            capacity:movie_capacity,
            seatsbooked:0, //initially 0
            base_price:movie_base_price
        });
        await movie.save();

        return res.status(201).json({msg:"created movie.",movie:movie});
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