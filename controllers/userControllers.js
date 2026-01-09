
const con = require("../config/database");
const sendOtpMail = require("../utils/OTP");


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
            res.json({
                status: "EXISTING_USER",
                user_id: user.rows[0].id,
                firstName: user.rows[0].first_name,
            });
        } else {
            res.json({
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
        const {email,first_name} = req.body;

        await con.query(
            "INSERT INTO users(email, first_name) VALUES ($1,$2)",

            [email, first_name]
        );

        console.log("User inserted...");

        res.status(200).json({
            message:"User created..."
        })

    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Server Error !"
        })
    }
}

