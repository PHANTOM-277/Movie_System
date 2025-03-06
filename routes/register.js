const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../schema/user.js');

router.post('/user', async(req,res)=>{
    try{
        const email = req.body.email;
        const password = req.body.password;
        if(!email || !password){
            //if data is not recieved
            return res.status(400).json({msg:"Email or Passwrod not received"});
        }
        const account = await User.findOne({email:email});
        if(account){
            //if an account with given email already exists.
            return res.status(400).json({msg:"An account with the given email already exists. Please choose a different username"});
        }
        //if we have reached till here then we can register
        //now we should hash the password and store it
        const salt = await bcrypt.genSalt(10);
        hashed_password = await bcrypt.hash(password, salt);
        await User.create({
            email:email,
            password:hashed_password,
            isAdmin:false
        });
        return res.status(201).json({msg:"Registered User"});
    }
    catch(e){
        console.log(`Error in user registeration : ${e}`);
        return res.status(500).json({msg:"Server Error"});
    }
});

module.exports = router;