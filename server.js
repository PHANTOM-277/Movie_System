/* import libraries*/
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');

/* import routes */
const register = require('./routes/register');
const login = require('./routes/login');
const logout = require('./routes/logout');
const movies = require('./routes/movies');

/* get environment variables*/
const port = process.env.PORT;
const connection_string = process.env.DBSTRING;

/* connect to mongodb*/
mongoose.connect(connection_string)
    .then(()=>console.log("Connected to Database"))
    .catch((e)=>console.log(`Error in connecting to database : ${e}`))

const app = express();

/* middleware*/

app.use(cors({
    origin: "http://localhost:5173", //frontend port url
    credentials: true, // Allow cookies
  }));// to allow frontend on different port to access the backend .
app.use(express.json());  // parse json
app.use(cookieParser());  // parse cookies

/* routes */
app.use('/register/', register);
app.use('/login/', login);
app.use('/logout/', logout);
app.use('/movies/', movies);

app.listen(port, ()=>console.log(`Up and running on port : ${port}`));