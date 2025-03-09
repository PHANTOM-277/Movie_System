
# Movie Backend System

This is a Movie Ticket Booking System built with Node.js, Express.js, and MongoDB. It allows users to register, log in, view movies, book tickets, and cancel bookings, while admins can add, cancel, or modify movies.




## Tech Stack

Backend: Node.js, Express.js

Database: MongoDB (Mongoose ODM)

Authentication: Session-based authentication

API Testing: Postman



## Installation

 1.)Clone the Repository

    git clone https://github.com/PHANTOM-277/Movie_System.git 

 2.)Move to the folder

    cd Movie_System

 3.)Intall Dependencies

    npm install

 4.)Setup .env file

    PORT={your-port}
    DBSTRING={your-mongodb-cnnection-string}
    
 5.)Start the server

    npm start
## API Endpoints
1. User Registration

    Endpoint: POST /register/user

     Description: Registers a new   user.


2. User Login

    Endpoint: POST /login/user  

    Description: Logs in a user and starts a session.


3. Admin Login

Endpoint: POST /login/admin

Description: Logs in an admin user.

4. Logout

    Endpoint: POST /logout

    Description: Ends a user/admin session.

5. Get All Upcoming Movies

    Endpoint: GET /movies/info

    Description: Retrieves all upcoming movies (excluding cancelled movies).

6. Get Details of a Specific Movie

Endpoint: GET /movies/info/:id

Description: Retrieves details of a specific movie, including status.

7. Admin Adds a New Movie

    Endpoint: POST /movies/admin/new_movie

Description: Allows an admin to add a new movie.

8. Admin Cancels a Movie

    Endpoint: PUT /movies/admin/delete_movie/:id

    Description: Cancels a movie (sets status to "cancelled" instead of deleting).

9. Admin Changes Seat Availability

    Endpoint: PUT /movies/admin/change_capacity/:id/:new_seats

    Description: Changes the total capacity of a movie.

10. User Books Movie Tickets

    Endpoint: POST /movies/booking/:id/:nseats

    Description: Books a ticket for a movie.

11. User Views Booking History

    Endpoint: GET /movies/user/bookinghistory

    Description: Retrieves a user’s past bookings.

12. User Cancels a Booking

    Endpoint: DELETE /movies/delete_booking/:id

    Description: Cancels a booking but does not delete it (marks isCancelled: true).

Find further Details on required parameters / http body / cookies in the postman collection.

## Dynamic Pricing

Movie ticket prices change dynamically based on:

Weekend Pricing: +10% increase on Saturday & Sunday

Peak Hours (7 PM - 10 PM): +5% increase

Early Booking Discount: -10% for first few seats

High Demand Pricing:

+5% if more than 30% of seats booked

+30% if more than 70% of seats booked

 Instead of making a separate simulation endpoint , I have encorporated the above in other routes itself. It checks if 70% seats
 are booked when a new booking happens . And other conditions such as weekend , peak hours etc , are checked when admin adds a new movie.

## Postman Link :

https://moviebackend23bce0379.postman.co/workspace/Movie_Backend_23BCE0379~09b52542-b968-4522-85fa-791f9be452c0/collection/39956887-8dd5777a-5192-49e0-8b51-44470d7d9f55?action=share&creator=39956887

## Other notes: 

I have not used docker since I only want to do upto level 2.
