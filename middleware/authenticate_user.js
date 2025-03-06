const Session = require('../schema/session');
const User = require('../schema/user');

const sessions = async (req,res,next)=>{
    try{
        const email = req.body.email;
        const sessionId = req.body.sessionId;
        
        if(!email || !sessionId){
            /* if user did not give either*/
            return res.status(400).json({msg:"Must provide email and sessionId"});
        }
        
        const session = await Session.findOne({email:email});
        
        if(!session){
            /* if user does not have an ongoing session*/
            return res.status(400).json({msg:"User does not have an ongoing session, please login first"});
        }
        
        const user = await User.findOne({email:email});
        if(!user){
            /* if the account had a sessionId and then was deleted*/
            return res.status(404).json({msg:"There is no account with this email."});
        }

        if(session.sessionId !== sessionId){
            /* if given sessionId does not match , for security , not allowed */
            return res.status(401).json({msg:"Invalid sessionId"});
        }

        if(session.expiresAt < new Date()){
            /* if session has expired */
            /* log the user out by deleting the session and ask user to log in */
            await Session.deleteOne({sessionId:sessionId});
            return res.status(400).json({msg:"Session expired. Please login again"});
        }
        /* if we reached till here , then user has a valid session */
        next(); // go to the next middleware
    }
    catch(e){
        console.log(`Error in sessions.js middleware : ${e}`);
        return res.status(500).json({msg:"Server Error"});
    }
}

module.exports = sessions;