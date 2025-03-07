//use this script to add admins . do : node --env-file=.env dev.js

const User = require('./schema/user');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const connection_string = process.env.DBSTRING;

/* connect to mongodb*/
mongoose.connect(connection_string)
    .then(()=>console.log("Connected to Database"))
    .catch((e)=>console.log(`Error in connecting to database : ${e}`))

const fxn = async ()=>{
    const password = "baka";
    const salt = await bcrypt.genSalt(10);
    const hashed_password = await bcrypt.hash(password, salt);

    const admin = new User({
        email:"Admin",
        password: hashed_password,
        isAdmin:true
    });

    await admin.save();
}

fxn()
    .then(()=>console.log("done"))
    .catch((e)=>console.log(`Error : ${e}`))