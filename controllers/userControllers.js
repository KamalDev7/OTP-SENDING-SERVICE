
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
        console.log("OTP Sent!: ", otp);
        const expiry = new Date(Date.now() + 5 * 60000);

        await con.query("DELETE FROM otps WHERE email=$1", [email]);
        await con.query(
            "INSERT INTO otps(email, otp, expires_at) VALUES ($1,$2,$3)",
            [email, otp, expiry]
        );

        await sendOtpMail(email, otp);

        console.log("------------------------Send OTP invoked with mail and OTP");

        res.json({ message: "OTP sent" });
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

        const user = await con.query(
            "SELECT id, first_name FROM users WHERE email=$1",
            [email]
        );

        if (user.rowCount > 0) {
            res.status(200).json({
                status: "EXISTING_USER",
                user_id: user.rows[0].id,
                firstName: user.rows[0].first_name,
            });
        } else {
            res.status(200).json({
                message: "OTP verified !",
                status: "NEW_USER"
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getProfiles = async (req, res) => {
    res.json({
        message: "User profile"
    });
}


exports.createUser = async (req, res) => {
    try {
        const { email, first_name } = req.body;

        await con.query(
            "INSERT INTO users(email, first_name) VALUES ($1,$2)",

            [email, first_name]
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


exports.subscription_create_order = async (req, res) => {

    console.log("* * * Subscription-create-order initialized * * *");

    try {
        // const { amount, email, phone } = req.body;

        const amount = "150";
        const email = "kamal@gmail.com";
        const phone = "9313400412"

        const requestBody = {
            order_amount: amount,
            order_currency: "INR",
            order_id: crypto.randomBytes(6).toString("hex"),
            customer_details: {
                customer_id: "cust_" + Date.now(),
                customer_phone: phone,
                customer_email: email
            },
            order_meta: {
                return_url: process.env.CASHFREE_RETURN_URL
            }
        };

        const response = await axios.post(
            "https://sandbox.cashfree.com/pg/orders",
            requestBody,
            {
                headers: {
                    "x-api-version": "2023-08-01",
                    "x-client-id": process.env.CLIENT_ID,
                    "x-client-secret": process.env.CLIENT_SECRET,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("***Order Created***");

        res.json(response.data);

    } catch (err) {
        console.error("Cashfree API Error:", err.response?.data || err.message);
        res.status(500).json({ error: "Order creation failed" });
    }
}