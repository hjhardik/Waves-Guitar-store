const mailer = require('nodemailer');
const { welcome } = require("./welcome_template");  ///email template when the user signs up for the first time
const { purchase } = require("./purchase_template"); ////email template when the user purchases 
const { resetPass } = require("./resetpass_template"); ////email template when password change is requested 
require('dotenv').config();


const getEmailData = (to,name,token,template,actionData) =>{
    let data = null;

    switch(template){
        case "welcome":
            data = {
                from: "Waves <waves.guitars.rev@gmail.com>",
                to,
                subject: `Welcome to waves ${name}`,
                html: welcome()
            }
        break;
        case "purchase":
            data = {
                from: "Waves <waves.guitars.rev@gmail.com>",
                to,
                subject: `Thanks for shopping with us ${name}`,
                html: purchase(actionData)
            }
        break;
        case "reset_password":
            data = {
                from: "Waves <waves.guitars.rev@gmail.com>",
                to,
                subject: `Hey ${name}, we have recieved password change request for your account.`,
                html: resetPass(actionData)
            }
        break;
        default:
            data;
    }
    return data;
}


const sendEmail = (to,name,token,type,actionData = null) => {

    const smtpTransport = mailer.createTransport({
        service:"Gmail",
        auth:{
            user: "waves.guitars.rev@gmail.com",
            pass: process.env.EMAIL_PASS
        }
    });

    const mail = getEmailData(to,name,token,type,actionData)

    smtpTransport.sendMail(mail,function(error,response){
        if(error){
            console.log(error);
        } else {
            cb()
        }
        smtpTransport.close();
    })
}

module.exports = { sendEmail }