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
// 

// const SibApiV3Sdk = require("sib-api-v3-sdk");

// const client = SibApiV3Sdk.ApiClient.instance;
// client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

// const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

// async function sendOtp(email, otp) {

//   console.log("----------------Send OTP function called !!");

//   await emailApi.sendTransacEmail({
//     sender: {
//       email: process.env.BREVO_SENDER,
//       name: "OTP Service"
//     },
//     to: [{ email }],
//     subject: "Your OTP Code",
//     htmlContent: `
//       Your OTP is <h2>${otp}</h2>
//       <p>This OTP is valid for 5 minutes.</p>
//     `
//   });

//   console.log("*******************OTP email sent successfully");
// }

// module.exports = sendOtp;




const SibApiV3Sdk = require("sib-api-v3-sdk");

const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

async function sendOtp(email, otp) {

  console.log("Send OTP function called !!");

  await emailApi.sendTransacEmail({
    sender: {
      email: process.env.BREVO_SENDER,
      name: "SeaNeB Autos"
    },
    to: [{ email }],
    subject: "SeaNeB Autos OTP Verification",
    htmlContent: `
< !DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>OTP Verification</title>
      </head>
      <body style="margin:0;padding:0;background-color:#f5f7fa;font-family:Arial,Helvetica,sans-serif;">

        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding:30px 0;">

              <table width="500" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;padding:30px;text-align:center;box-shadow:0 4px 12px rgba(0,0,0,0.08);">

                <!-- Logo -->
                <tr>
                  <td style="padding-bottom:20px;">
                    <img src="https://seaneb.in/img/logo.png" alt="SeaNeB Autous" width="90" />
                  </td>
                </tr>

                <!-- Title -->
                <tr>
                  <td style="font-size:22px;font-weight:bold;padding-bottom:10px;">
                    <span style="color:#000;">SeaNeB Autos</span>
                    <span style="color:#2e7d32;"> OTP Verification</span>
                  </td>
                </tr>

                <!-- Subtitle -->
                <tr>
                  <td style="font-size:15px;color:#444;padding-bottom:20px;">
                    Your One-Time Password is:
                  </td>
                </tr>

                <!-- OTP -->
                <tr>
                  <td style="font-size:32px;font-weight:bold;letter-spacing:6px;color:#222;padding:15px 0;">
                    ${otp}
                  </td>
                </tr>

                <!-- Validity -->
                <tr>
                  <td style="font-size:14px;color:#555;padding-bottom:25px;">
                    Valid for <b>5 minutes</b>. Please do not share it with anyone.
                  </td>
                </tr>

                <!-- Divider -->
                <tr>
                  <td>
                    <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="font-size:12px;color:#888;">
                    This is an automated email from <b>SeaNeB Autos</b>.
                  </td>
                </tr>

              </table>

            </td>
          </tr>
        </table>

      </body>
    </html>
    `
  });

  console.log("OTP email sent successfully");
}

module.exports = sendOtp;
