const nodemailer = require("nodemailer");
const constant = require("../shared/constant");
const MAIL = constant.MAIL;

const transport = nodemailer.createTransport({
    service: MAIL.service,
    auth: {
        user: MAIL.senderUser,
        pass: MAIL.senderPwd
    }
});

exports.sendMail = function(bodyStr){
    var mailOptions = {
        from: MAIL.senderUser,
        to: MAIL.sendTo,
        subject: "game-server error",
        text: bodyStr
    };
    transport.sendMail(mailOptions, function(err, info){
        console.log("mail send:  ", err, info);
    });
}