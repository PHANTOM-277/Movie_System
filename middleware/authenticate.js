const Session = require('../schema/session');
const User = require('../schema/user');

const sessions = (mode)=>{
    //mode = 1 means authentication for admin , mode != 1 is authentication for users
    return async (req,res,next)=>{
        try{
            const email = req.body.email || req.query.email;
            const sessionId = req.headers.authorization || req.cookies.sessionId;
            
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
                await Session.deleteOne({sessionId:sessionId});//delete it from our database
                return res.status(404).json({msg:"There is no account with this email."});
            }

            if(mode === 1 && !user.isAdmin){
                /* if authentication is for admin and user is not admin */
                return res.status(403).json({msg:"User is not an admin"});
            }

            if(session.sessionId !== sessionId){
                /* if given sessionId does not match , for security , not allowed */
                return res.status(401).json({msg:"Invalid sessionId"});
            }

            if(session.expiresAt < new Date()){
                /* if session has expired */
                /* log the user out by deleting the session and ask user to log in */
                await Session.deleteOne({sessionId:sessionId});
                return res.status(403).json({msg:"Session expired. Please login again"});
            }
            /* if we reached till here , then user has a valid session */

            //also add the user object to req to be accessed by other routes/middleware
            req.user = user;
            next(); // go to the next middleware
        }
        catch(e){
            console.log(`Error in sessions.js middleware : ${e}`);
            return res.status(500).json({msg:"Server Error"});
        }
    }
}

module.exports = sessions;