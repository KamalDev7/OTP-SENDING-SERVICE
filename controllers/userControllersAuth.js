const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");

const con = require("../config/database");
const sendOtpMail = require("../utils/OTP");
const crypto = require("crypto");
const axios = require("axios");


exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log("OTP generated: ", otp);
    const expiry = new Date(Date.now() + 5 * 60000);

    await con.query("DELETE FROM otps WHERE email=$1", [email]);
    await con.query(
      "INSERT INTO otps(email, otp, expires_at) VALUES ($1,$2,$3)",
      [email, otp, expiry]
    );

    await sendOtpMail(email, otp);

    console.log("------------------------Send OTP invoked with mail and OTP");
    console.log(`email:${email}`);

    res.json({ message: "OTP sent !" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email & OTP required"
      });
    }

    const otpResult = await con.query(
      "SELECT otp FROM otps WHERE email = $1 AND expires_at > NOW()",
      [email]
    );

    if (
      otpResult.rowCount === 0 ||
      otp !== otpResult.rows[0].otp
    ) {
      return res.status(400).json({
        message: "Wrong OTP or expired"
      });
    }

    await con.query(
      "DELETE FROM otps WHERE email = $1",
      [email]
    );

    const userResult = await con.query(
      `
      SELECT
        u.user_id,
        u.full_name,
        u.email,
        u.phone,
        u.role_id,
        r.role_name
      FROM users1 u
      JOIN roles r ON r.role_id = u.role_id
      WHERE u.email = $1
      `,
      [email]
    );

    if (userResult.rowCount > 0) {
      const user = userResult.rows[0];

      const businessResult = await con.query(
        `
    SELECT business_id
    FROM businesses
    WHERE dealer_id = $1
    `,
        [user.user_id]
      );

      const businessRegistered = businessResult.rowCount > 0;

      return res.status(200).json({
        message: "OTP verified",
        user_status: "EXISTING_USER",
        userExist: true,

        user: {
          user_id: user.user_id,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          role_id: user.role_id,
          role: user.role_name,
          businessRegistered
        }
      });
    }

    res.status(200).json({
      message: "OTP verified",
      user_status: "NEW_USER",
      userExist: false
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};


exports.createUser = async (req, res) => {
  try {
    const { full_name, email, phone } = req.body;

    if (!full_name || !email) {
      return res.status(400).json({
        message: "full_name and email are required"
      });
    }

    await con.query(
      `
      INSERT INTO users1 (full_name, email, phone)
      VALUES ($1, $2, $3)
      `,
      [full_name, email, phone]
    );

    console.log("User inserted successfully");

    res.status(201).json({
      message: "User created successfully",
      role: "user"
    });

  } catch (err) {
    console.error(err);

    if (err.code === "23505") {
      return res.status(409).json({
        message: "Email already exists"
      });
    }

    res.status(500).json({
      message: "Server error"
    });
  }
};
