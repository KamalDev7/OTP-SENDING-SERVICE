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
            return res.status(400).json({ message: "Email & OTP required" });
        }

        const result = await con.query(
            "SELECT otp FROM otps WHERE email=$1 AND expires_at > NOW()",
            [email]
        );

        if (result.rowCount === 0 || otp !== result.rows[0].otp) {
            return res.status(400).json({ message: "Wrong OTP or Expired !" });
        }

        await con.query("DELETE FROM otps WHERE email=$1", [email]);


        // const user = await con.query(
        //     "SELECT id, first_name FROM users WHERE email=$1",
        //     [email]
        // );

        const user = await con.query(
            "SELECT user_id, full_name,role,status FROM users1 WHERE email=$1",
            [email]
        );

        if (user.rowCount > 0) {
            res.status(200).json({
                user_status: "EXISTING_USER",
                user_id: user.rows[0].user_id,
                full_name: user.rows[0].full_name,
                role: user.rows[0].role,
                status: user.rows[0].status,
                userExist: true
            });


        } else {
            res.status(200).json({
                message: "OTP verified !",
                user_status: "NEW_USER",
                userExist: false
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const response = await con.query(
            "SELECT * FROM users1"
        );

        if (response.rowCount > 0) {
            res.status(200).json({
                users: response.rows
            });
        }
        console.log(`All user got !`);

    } catch (err) {
        console.log(err);
    }
}


exports.createUser = async (req, res) => {
    try {
        const { full_name, email, phone, role } = req.body;

        await con.query(
            "INSERT INTO users1(full_name,email,phone,role) VALUES ($1,$2,$3,$4)",

            [full_name, email, phone, role]
        );

        console.log("User inserted...");

        res.status(200).json({
            message: "User created..."
        })

    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Server Error !"
        })
    }
}

exports.getUserStatus = async (req, res) => {
    try {
        const { email } = req.params;

        const response = await con.query(
            "SELECT status FROM users1 WHERE email=$1",
            [email]
        );

        if (response.rowCount > 0) {
            res.status(200).json({
                status: response.rows[0].status,
            });
        }
        console.log(`Uer ststus:: ${response.rows[0].status}`);

    } catch (err) {
        console.log(err);
    }
}

exports.setUserStatus = async (req, res) => {
    try {
        const { email, status } = req.body;

        const response = await con.query(
            "UPDATE users1 set status=$1 where email=$2",
            [status, email]
        );

        if (response.rowCount === 0) {
            res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "User status updated successfully",
            email
        });

        console.log(`User status changed : ${email}`);

    } catch (err) {
        console.log(err);
    }
}

exports.changeUserRole = async (req, res) => {
    try {
        const { email } = req.body;

        const response =
            await con.query(
                "update users1 set role='dealer' where email=$1",
                [email]
            );

        if (response.rowCount === 0) {
            res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "User role updated successfully",
            email
        });

        console.log(`User role changed to Dealer :: ${email}`);

    } catch (err) {
        console.log(err);
    }
}


