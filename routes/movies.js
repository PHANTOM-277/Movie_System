const express = require('express');
const mongoose = require('mongoose');
const Movie = require('../schema/movie');
const authenticate = require('../middleware/authenticate');
const User = require('../schema/user');
const router = express.Router();

router.get('/info', async(req,res)=>{
    /* endpoint to retrieve all future scheduled movies */
    try{
        const movies = await Movie.find({
            date:{$gte:new Date()} , //gets movies which are scheduled after current time. 
            status:{$ne:"cancelled"}
        }).sort({date:1}); //show earliest movies first , note movies which are over are already filtered out

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

router.get('/info/:id', async(req,res)=>{
    /* endpoint to retrieve info on given movie id */
    try{
        const id = req.params.id;
        const movie = await Movie.findById(id);//gets movie
        if(!movie){
            //if no such movie is found
            return res.status(404).json({msg:"No movies scheduled"});
        }
        //send movies
        return res.status(200).json({movie:movie,msg:"To book a movie , use the id sent"});
    }
    catch(e){
        console.log(`Error in displaying available movies : ${e}`);
        res.status(500).json({msg:"Server Error"});
    }
});

router.post('/admin/new_movie', authenticate(1), async(req,res)=>{
    //this route is only for admin , hence the authenticate(1)
    try{
        const { email, movie_name , movie_date , movie_capacity, movie_base_price, movie_img_URL } = req.body;
        //console.log(movie_img_URL);
        if(!movie_name || !movie_date || !movie_capacity || !movie_base_price || !movie_img_URL){
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
        let new_price = movie_base_price;
        
        //check if weekend
        const movieDate = new Date(parsed_movie_date);
        const dayOfWeek = movieDate.getDay(); // 0 = Sunday, 6 = Saturday
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            new_price *= 1.10; // Increase by 10% 
        }

        //check if peak hours 7pm - 10pm 
        const movieHour = movieDate.getHours();
        if (movieHour >= 19 && movieHour < 22) {
            new_price *= 1.05; // Increase by 5%
        }

        //since no seats booked now , give 10 % off
        new_price *= 0.90;

        const movie = new Movie({
            name:movie_name,
            date:parsed_movie_date,
            capacity:movie_capacity,
            seatsbooked:0, //initially 0
            base_price:movie_base_price,
            current_price:movie_base_price,
            image_URL:movie_img_URL,
            status:"active"
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

        if(movie.status === "cancelled"){
            //if movie is cancelled by admin
            return res.status(400).json({msg:`Movie with id ${id} is cancelled`});
        }

        if (movie.date < new Date()) {
            return res.status(400).json({ msg: `Movie with id ${id} is already over` });
        }

        if (movie.capacity - movie.seatsbooked < nseats) {
            return res.status(400).json({ msg: `Can't book ${nseats}, seats left: ${movie.capacity - movie.seatsbooked}` });
        }

        let new_price = movie.base_price;
        //If more than 70% seats booked, increase price by 30%
        if (movie.seatsbooked + nseats > 0.7 * movie.capacity) {
            //higher demand movie
            new_price *= 1.3; // Increase by 30%
        }
        else if(movie.seatsbooked + nseats > 0.3*movie.capacity){
            new_price *= 1.05; //Increase by 5%
        }
        
        const updatedMovie = await Movie.findOneAndUpdate(
            {_id:id, seatsbooked:{$lte:movie.capacity-nseats}, date:{$gt:new Date()}},
            {
                $inc : {seatsbooked: nseats}, //increase it by nseats
                $set : {current_price : new_price.toFixed(2)} //set the dynamic price , 2 decimal places
            }, 
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
            booked_at: new Date(),
            isCancelled: false
        });
        
        await user.save();

        return res.status(201).json({msg:"Booking made!", booking:user.bookings[user.bookings.length - 1], amount_paid:movie.current_price});
    }
    catch(e){
        console.log(`Error in booking movie seat : ${e}`);
        res.status(500).json({msg:"Server Error"});
    }
});

router.get('/user/bookinghistory', authenticate(0), async(req,res)=>{
    try{
        //basically show the array of bookings 
        //we already have req.user
        const bookinghistory = await User.findOne(
            {email:req.user.email},
            {email:1, _id:0, "bookings.nseats":1, "bookings.booked_at":1, "bookings.isCancelled":1}
        ).populate("bookings.movie","name date status image_URL") //projection on movies  objects , _id and these fields of the movie object will be displayed

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

router.put('/admin/delete_movie/:id', authenticate(1), async(req,res)=>{
    //allow an admin to delete a movie
    /* the idea is that a movie can't be deleted , however its status can be set as cancelled*/

    try{
        const id = req.params.id;//id of the movie
        if(!id){
            //invalid id
            return res.status(400).json({msg:"Enter a valid id"});
        }
        let movie = await Movie.findOne({_id:id});//get the movie document
        if(!movie){
            //if there's no such movie
            return res.status(404).json({msg:`No movie with id:${id} found`});
        }
        if(movie.status === "cancelled"){
            return res.status(400).json({msg:"Movie status is cancelled already."});
        }
        movie.status = "cancelled";//set the status to "cancelled".
        await movie.save(); //save the document

        return res.status(200).json({msg:"movie status changed to cancelled"});
    }
    catch(e){
        console.log(`Error in deleting movie : ${e}`);
        res.status(500).json({msg:"Server Error"});
    }
});

router.put('/admin/change_capacity/:id/:new_seats', authenticate(1), async(req,res)=>{
    //allows changing of seats, But if seats given by admin < how many are booked , then not allowed.
    try{
        const id = req.params.id;
        const new_seats = parseInt(req.params.new_seats);
        if(!id){
            //no id given
            return res.status(400).json({msg:"No movie id received"});
        }
        if(!new_seats || isNaN(new_seats)){
            //if new_seats is invalid
            return res.status(400).json({msg:"New seats mentioned is invalid"});
        }
        const movie = await Movie.findById(id);//fetch the id
        if(!movie){
            //no such movie found
            return res.status(404).json({msg:`No movie with ${id} found`});
        }
        if(movie.seatsbooked > new_seats){
            //if the no.of seats booked is already greater than new_seats , then change is not allowed
            return res.status(400).json({msg:`Change not allowed , seats booked already : ${movie.seatsbooked}`});
        }

        //if we have reached here we can change the number of seats.
        await Movie.findByIdAndUpdate(id,{$set:{capacity:new_seats}});

        res.status(200).json({msg:`Capacity changed to ${new_seats}`});
    }
    catch(e){
        console.log(`Error in changing capacity : ${e}`);
        res.status(500).json({msg:"Server Error"});
    }
})

router.delete('/delete_booking/:id', authenticate(0), async(req,res)=>{
    try{
        //so user is logged in , req.user already contains everything we need
        //check if the movie with this id is in bookings or not
        const id = req.params.id;
        if(!id){
            //if id is not recieved
            return res.status(400).json({msg:"booking ID not received"});
        }
        let user = req.user;
        const user_movies = user.bookings;
        const index = user_movies.findLastIndex((item)=>item.movie.toString() === id && !item.isCancelled);//finds movies with same id where it is not cancelled
        if(index === -1){
            //if this movie is not found here
            return res.status(404).json({msg:"No booking for this movie was made by this user"});
        }
        //if it was found , just check if the date is less than now
        let movie = await Movie.findById(id);
        if(!movie){
            //no movie found
            return res.status(404).json({msg:"No such movie found"});//this should ideally not happen as we are taking care of it above
        }
        if(movie.date < new Date()){
            //cant cancel a movie which is already over
            return res.status(400).json({msg:"Can't cancel a movie which is already over"});
        }
        //now we can actually cancel it
        
        user.bookings[index].isCancelled = true;
        await user.save();
        //also we should now reduce the seatsbooked for this movie
        movie.seatsbooked = movie.seatsbooked - user.bookings[index].nseats;
        await movie.save();

        return res.status(200).json({msg:`Movie of id:${id} cancelled`});

    }
    catch(e){
        console.log(`Error in cancelling booking for user : ${req.user.email}, Error : ${e}`);
        res.status(500).json({msg:"Server Error"});
    }
});

module.exports = router;