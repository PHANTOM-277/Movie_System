/* import libraries*/
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

/* import routes */
const register = require('./routes/register');
const login = require('./routes/login');
const logout = require('./routes/logout');
/* get environment variables*/
const port = process.env.PORT;
const connection_string = process.env.DBSTRING;

/* connect to mongodb*/
mongoose.connect(connection_string)
    .then(()=>console.log("Connected to Database"))
    .catch((e)=>console.log(`Error in connecting to database : ${e}`))

const app = express();

/* middleware*/
app.use(express.json());  // parse json
app.use(cookieParser());  // parse cookies

/* routes */
app.use('/register/', register);
app.use('/login/', login);
app.use('/logout/', logout)

app.listen(port, ()=>console.log(`Up and running on port : ${port}`));