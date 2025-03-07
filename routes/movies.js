const express = require('express');
const mongoose = require('mongoose');
const Movie = require('../schema/movie');
const authenticate = require('../middleware/authenticate');
const User = require('../schema/user');
const router = express.Router();

router.get('/info', async(req,res)=>{
    /* endpoint to retrieve all future scheduled movies */
    try{
        const movies = await Movie.find({date:{$gte:new Date()}});//gets movies which are scheduled after current time. 
        //no point showing user movies which are already finished
        if(movies.length === 0){
            //if no movies are scheduled
            return res.status(404).json({msg:"No movies scheduled"});
        }
        //send all movies
        return res.status(200).json({movies:movies,msg:"To book a movie , use the id sent"});
    }
    catch(e){
        console.log(`Error in displaying available movies : ${e}`);
        res.status(500).json({msg:"Server Error"});
    }
});

router.post('/admin/new_movie', authenticate(1), async(req,res)=>{
    //this route is only for admin , hence the authenticate(1)
    try{
        const { email, movie_name , movie_date , movie_capacity, movie_base_price } = req.body;
        if(!movie_name || !movie_date || !movie_capacity || !movie_base_price){
            //not enough information
            return res.status(400).json({msg:"Missing Information , please give movie name, date, capacity and base price."});
        }
        const parsed_movie_date = new Date(movie_date);//parse the date given into Date object
        if (isNaN(parsed_movie_date.getTime())){
            //if invalid date
            return res.status(400).json({ msg: "Invalid date format." });
        }
        if (parsed_movie_date < new Date()){
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
        await movie.save();//save the document

        return res.status(201).json({msg:"created movie.",movie:movie});
    }
    catch(e){
        console.log(`Error in adding new movie : ${e}`);
        res.status(500).json({msg:"Server Error"});
    }
});

router.post('/booking/:id/:nseats', authenticate(0) , async(req,res)=>{
    //this route is for users , admin can book seats too :)
    try{
        //basically try to add the id of the movie into the booking array of user
        //so user is logged in , in the bookings section , push the movie in that array
        //also increase the seatsbooked in that movie document
        const id = req.params.id;
        const nseats = parseInt(req.params.nseats);
        if(!id){
            //if id is invalid
            return res.status(400).json({msg:"Invalid movie id"});
        }
        if(!nseats || isNaN(nseats) || nseats <= 0){
            //invalid number of seats
            return res.status(400).json({msg:"Invalid number of seats"});
        }
        /* get the user object and the movie object */

        let user = req.user;//this was added during authentication

        
        let movie = await Movie.findOne({_id:id});
        if(!movie){
            //if movie with this id is not found
            return res.status(404).json({msg:`Movie with id ${id} not found`});
        }

        if (movie.date < new Date()) {
            return res.status(400).json({ msg: `Movie with id ${id} is already over` });
        }

        if (movie.capacity - movie.seatsbooked < nseats) {
            return res.status(400).json({ msg: `Can't book ${nseats}, seats left: ${movie.capacity - movie.seatsbooked}` });
        }
        
        const updatedMovie = await Movie.findOneAndUpdate(
            {_id:id, seatsbooked:{$lte:movie.capacity-nseats}, date:{$gt:new Date()}},
            {$inc : {seatsbooked: nseats}}, //increase it by nseats
            {new:true}//get the updated doc
        );

        if(!updatedMovie){
            //if for some reason we still couldn't book
            return res.status(400).json({msg:"could not book ticket."});
        }

        //add the booking in user object by pushing it in the bookings array
        user.bookings.push({
            nseats:nseats,
            movie:updatedMovie._id,
            booked_at: new Date()
        });
        
        await user.save();

        return res.status(201).json({msg:"Booking made!", booking:user.bookings[user.bookings.length - 1]});
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

router.get('/user/bookinghistory', authenticate(0), async(req,res)=>{
    try{
        //basically show the array of bookings 
        //we already have req.user
        const bookinghistory = await User.findOne(
            {email:req.user.email},
            {email:1, _id:0, "bookings.nseats":1, "bookings.booked_at":1}
        ).populate("bookings.movie","name date") //projection on movies  objects in the bookings array elements

        if(!bookinghistory || bookinghistory.bookings.length === 0){
            //if no booking history is received . i.e either the user does not exist or bookings array is empty
            return res.status(404).json({msg:"No booking history found"});
        }

        //return bookinghistory
        res.status(200).json({bookinghistory:bookinghistory});
    }
    catch(e){   
        console.log(`Error in retrieving bookinghistory for user ${req.user.email} , ${e}`);
        res.status(500).json({msg:"Server Error"});
    }
});

module.exports = router;