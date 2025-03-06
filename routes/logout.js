const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Session = require('../schema/session');

router.post('/user', async (req,res)=>{
    /* User must provide sessionId and username for logout*/
    try{
        const email = req.body.email;
        const sessionIdProvided = req.headers.authorization || req.cookies.sessionId;;
        if(!email || !sessionIdProvided){
            return res.status(400).json({msg:"Email and SessionId must be given to log out."});
        }
        const session = await Session.findOne({sessionId:sessionIdProvided});
        if(!session){
            return res.status(404).json({msg:"Invalid Session Id"});
        }
        if(session.email !== email){
            return res.status(404).json({msg:"SessionId does not match user"});
        }
        /* if we have reached till here , then user can be logged out*/
        await Session.deleteOne({sessionId:sessionIdProvided});
        return res.status(200).json({msg:"Successfully logged out user"});
    }
    catch(e){
        console.log(`Error in logging out : ${e}`);
        return res.status(500).json({msg:"Server Error"});
    }
});

module.exports = router;