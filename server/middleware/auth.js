const {User} = require('./../models/user');

let auth = (req,res,next) => {  ///next is used to go to terminate this function 
                               ///and move over to the next instruction which is
                               /// present in the code from where this function i.e. auth() is called 
    let token = req.cookies.w_auth;

    User.findByToken(token,(err, user)=>{    /// user-defined method
        if(err) throw err;
        if(!user) return res.json({isAuth:false, error:err});
        //else

        req.token = token;
        req.user = user;
        next(); ///goes to the next function i.e. (req,res)=>{......} which is present after "auth" 
    });
};

module.exports = {auth}