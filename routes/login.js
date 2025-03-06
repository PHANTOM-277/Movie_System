const express = require('express');
const router = express.Router();
const User = require('../schema/user');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const Session = require('../schema/session');

const generateId= (email)=> {
    const timestamp = Date.now().toString();
    const random = Math.random().toString();
    const userdata = email || 'anonymous';

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
        const session = await Session.findOne({email:email});
        if(session){
            //if a session already exists , if its expired , delete it
            if(is_prevSession.expiresAt < new Date()){
                await Session.deleteOne({email:email});
            }
            else{
                //if its not expired , give the previous sessionId
                return res.status(400).json({msg:"User already logged in", sessionId:session.sessionId});
            } 
        }
        //check if its
        const sessionId = generateId(email);

        const new_session = new Session({
            email : email,
            sessionId : sessionId,
            timeStamp : new Date(),
            expiresAt : new Date(Date.now() + 10 * 60 * 1000), //two minutes 
        });

        await new_session.save();//save it in the database

        return res.status(200).json({msg:"Login Successful", sessionId:sessionId}); 
    }
    catch(e){
        console.log(`Error in logging user in : ${e}`);
        return res.status(500).json({msg:"Server error"});
    }
});

router.post('/admin', async(req,res)=>{
    try{
        const username = req.body.username;
        const password = req.body.password;
        if(!username || !password){
            
        }
    }
    catch(e){
        console.log(`Error in logging in admin : ${e}`);
        res.status(500).json({msg:"Server Error"});
    }
})

module.exports = router;