const express = require('express');
const mongoose = require('mongoose');

const port = process.env.PORT;
const connection_string = process.env.DBSTRING;

mongoose.connect(connection_string)
    .then(()=>console.log("Connected to Database"))
    .catch((e)=>console.log(`Error in connecting to database : ${e}`))

const app = express();

app.listen(port, ()=>console.log(`Up and running on port : ${port}`));