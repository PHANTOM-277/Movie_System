const express = require('express');
const mongoose = require('mongoose');

const port = process.env.PORT;
const connection_string = process.env.DBSTRING;

const app = express();

app.listen(port, ()=>console.log(`Up and running on port : ${port}`));