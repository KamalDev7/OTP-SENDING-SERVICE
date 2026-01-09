const nodemailer = require('nodemailer');

function sendOtp(mail, OTP) {

  console.log("Send OTP function called !!");

    // Create transporter using Gmail
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_USER,      // your email
            pass: process.env.MAIL_PASS // app password
        }
    });

    // Mail options
    const mailOptions = {
        from: process.env.MAIL_USER,
        to: mail,
        subject: 'Your OTP',
        text: `Hello! your One Time Password is :  ${OTP} `
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });

}

module.exports = sendOtp;