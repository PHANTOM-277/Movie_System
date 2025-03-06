const express = require('express');
const router = express.Router();
const User = require('../schema/user');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const Session = require('../schema/session');

const generateId= (email)=> {
    const timestamp = Date.now().toString();
    const random = Math.random().toString();
    const userdata = username || 'anonymous';

    const combined = timestamp + random + userdata;

    const hash = crypto.createHash('sha256');
    hash.update(combined);

    return hash.digest('hex');
}

router.post('/user', async(req,res)=>{
    try{
        const email = req.body.email;
        const password = req.body.password;
        if(!email || !password){
            return res.status(400).json({msg:"email or password not received."});
        }
        const user = await User.findOne({email:email});
        if(!user){
            return res.status(404).json({msg:"No user found with that email"});
        }
        if(!await bcrypt.compare(password,user.password)){
            return res.status(400).json({msg:"Invalid password"});
        }

        //check if its
        const sessionId = generateId(email);
        await 
    }
    catch(e){
        console.log(`Error in logging user in : ${e}`);
        return res.status(500).json({msg:"Server error"});
    }
});