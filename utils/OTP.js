// const nodemailer = require('nodemailer');

// function sendOtp(mail, OTP) {

//   console.log("Send OTP function called !!");

//     // Create transporter using Gmail
//     const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//             user: process.env.MAIL_USER,      // your email
//             pass: process.env.MAIL_PASS // app password
//         }
//     });

//     // Mail options
//     const mailOptions = {
//         from: process.env.MAIL_USER,
//         to: mail,
//         subject: 'Your OTP',
//         text: `Hello! your One Time Password is :  ${OTP} `
//     };

//     // Send email
//     transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//             console.log('Error:', error);
//         } else {
//             console.log('Email sent:', info.response);
//         }
//     });

// }

// module.exports = sendOtp;





// 
const SibApiV3Sdk = require("sib-api-v3-sdk");

const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

async function sendOtp(email, otp) {

  console.log("----------------Send OTP function called !!");

  await emailApi.sendTransacEmail({
    sender: {
      email: process.env.BREVO_SENDER,
      name: "OTP Service"
    },
    to: [{ email }],
    subject: "Your OTP Code",
    htmlContent: `
      <h2>Your OTP is ${otp}</h2>
      <p>This OTP is valid for 5 minutes.</p>
    `
  });

  console.log("*******************OTP email sent successfully");
}

module.exports = sendOtp;
