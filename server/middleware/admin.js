let admin = (req,res,next) => {
    if(req.body.role === 0){  //if the user is not an admin
        return res.send('You are not allowed.')
    }
    //else
    next();
}

module.exports = {admin}