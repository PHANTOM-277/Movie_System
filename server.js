/* import libraries*/
const express = require('express');
const mongoose = require('mongoose');

/* import routes */
const register = require('./routes/register');
/* get environment variables*/
const port = process.env.PORT;
const connection_string = process.env.DBSTRING;

/* connect to mongodb*/
mongoose.connect(connection_string)
    .then(()=>console.log("Connected to Database"))
    .catch((e)=>console.log(`Error in connecting to database : ${e}`))

const app = express();

/* middleware*/
app.use(express.json());

/* routes */
app.use('/register/', register);
app.use('/login/user', user_login);

app.listen(port, ()=>console.log(`Up and running on port : ${port}`));