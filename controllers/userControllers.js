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
        const { amount, email, phone } = req.body;

        // const amount = "150";
        // const email = "kamal@gmail.com";
        // const phone = "9334441122"

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

exports.subscription_verify_order = async (req, res) => {
    try {
        const { orderId } = req.params;

        const response = await axios.get(
            `https://sandbox.cashfree.com/pg/orders/${orderId}`,
            {
                headers: {
                    "x-api-version": "2023-08-01",
                    "x-client-id": process.env.CLIENT_ID,
                    "x-client-secret": process.env.CLIENT_SECRET
                }
            }
        );

        const paymentStatus = response.data.payments?.[0]?.payment_status;
        const orderStatus = response.data.order_status;

        console.log("Order Verified:", orderStatus, paymentStatus);

        // Redirect back to frontend with status
        res.redirect(`${process.env.FRONTEND_URL}?orderId=${orderId}&status=${orderStatus}`);

    } catch (err) {
        console.error("Verify Error:", err.response?.data || err.message);
        res.redirect(`${process.env.FRONTEND_URL}?status=FAILED`);
    }
}

exports.invoice = async (req, res) => {
    try {
        const { orderId } = req.params;

        // Get order details from Cashfree
        const response = await axios.get(
            `https://sandbox.cashfree.com/pg/orders/${orderId}`,
            {
                headers: {
                    "x-api-version": "2023-08-01",
                    "x-client-id": process.env.CLIENT_ID,
                    "x-client-secret": process.env.CLIENT_SECRET
                }
            }
        );

        const order = response.data;

        if (order.order_status !== "PAID") {
            return res.status(400).json({ message: "Invoice only for PAID orders" });
        }

        const doc = new PDFDocument({ margin: 40 });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=invoice-${orderId}.pdf`);

        doc.pipe(res);

        // Logo
        const logoPath = path.join(__dirname, "logo.jpeg");

        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 500, 20, { width: 70 });
        }

        doc.fontSize(20).text("SeaNeB Autos ", 40, 20);
        doc.fontSize(10)
            .text("Anand,Gujrat 388315", 40, 45)
            .text("Phone: 9999999999", 40, 60)
            .text("Email: hello@seanebautos.com", 40, 75);

        doc.fontSize(10)
            .text(`Invoice #: ${order.order_id}`, 350, 45)
            .text(`Invoice Date: ${new Date().toLocaleDateString()}`, 350, 60)
            .text(`Payment Status: ${order.order_status}`, 350, 75);

        doc.moveDown(2);

        // Bill 
        doc.fontSize(12).text("Bill To:", 40, 120);
        doc.fontSize(10)
            .text(order.customer_details.customer_email, 40, 140)
            .text(order.customer_details.customer_phone, 40, 155);

        doc.moveTo(40, 190).lineTo(550, 190).stroke();

        doc.fontSize(10)
            .text("QTY", 40, 200)
            .text("DESCRIPTION", 80, 200)
            .text("UNIT PRICE", 350, 200)
            .text("AMOUNT (INR) ", 450, 200);

        doc.moveTo(40, 215).lineTo(550, 215).stroke();


        let unit = 5;
        let amount = order.order_amount * unit;

        doc.fontSize(10)
            .text("1", 40, 230)
            .text("Car Listing Subscription", 80, 230)
            .text("" + order.order_amount, 350, 230)
            .text("" + amount, 450, 230);

        doc.moveTo(40, 260).lineTo(550, 260).stroke();

        // 🔹 Totals
        doc.fontSize(10)
            .text("Subtotal:", 350, 280)
            .text("" + amount, 450, 280);

        const tax = amount * 0.18;

        doc.fontSize(10)
            .text("Tax (18%):", 350, 295)
            .text(`${tax}`, 450, 295);

        const total = amount + tax;
        doc.fontSize(12).text("Total:", 350, 320);
        doc.fontSize(12).text("" + total, 450, 320);

        doc.moveDown(4);

        doc.fontSize(12).text("Thank you for your payment ", 40, 380);

        doc.end();

    } catch (err) {
        console.error("Invoice Error:", err.response?.data || err.message);
        res.status(500).json({ message: "Invoice generation failed" });
    }
}
