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
  const doc = new PDFDocument({ margin: 30, size: "A4" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=tax-invoice.pdf");
  doc.pipe(res);

  /* ---------------- HEADER ---------------- */
  const logo = path.join(__dirname, "./logo.png");
  if (fs.existsSync(logo)) {
    doc.image(logo, 40, 30, { width: 80 });
  }

  doc.fontSize(11).text(
    `SeaNeB Technologies Pvt Ltd
Anand Gujarat 388315
India
GSTIN 24ABACS7760H1Z9
rohan@seaneb.com
www.seaneb.org`,
    140,
    35
  );

  doc.fontSize(20).text("TAX INVOICE", 420, 40);

  /* ---------------- INVOICE INFO BOX ---------------- */
  doc.rect(30, 130, 535, 70).stroke();

  doc.fontSize(10)
    .text("Invoice # : INV-000060", 40, 140)
    .text("Invoice Date : 27/06/2025", 40, 155)
    .text("Terms : Due on Receipt", 40, 170)
    .text("Due Date : 27/06/2025", 40, 185);

  doc.text("Place Of Supply : Gujarat (24)", 350, 140);

  /* ---------------- BILL TO ---------------- */
  doc.rect(30, 210, 535, 40).stroke();
  doc.fontSize(10).text(
    "Bill To\nRohan Patel , SeaNeB Technologies pvt Ltd",
    40,
    220
  );

  /* ---------------- TABLE HEADER ---------------- */
  let tableTop = 270;

  const col = {
    sn: 30,
    desc: 55,
    qty: 250,
    rate: 290,
    cgstP: 335,
    cgstA: 375,
    sgstP: 420,
    sgstA: 460,
    amt: 505
  };

  doc.fontSize(9);
  doc.text("#", col.sn, tableTop);
  doc.text("Item & Description", col.desc, tableTop);
  doc.text("Qty", col.qty, tableTop);
  doc.text("Rate", col.rate, tableTop);
  doc.text("CGST %", col.cgstP, tableTop);
  doc.text("Amt", col.cgstA, tableTop);
  doc.text("SGST %", col.sgstP, tableTop);
  doc.text("Amt", col.sgstA, tableTop);
  doc.text("Amount", col.amt, tableTop);

  doc.moveTo(30, tableTop + 15).lineTo(565, tableTop + 15).stroke();

  /* ---------------- TABLE ROW ---------------- */
  const qty = 1;
  const rate = 10;
  const subtotal = qty * rate;
  const cgst = +(subtotal * 0.09).toFixed(2);
  const sgst = +(subtotal * 0.09).toFixed(2);
  const total = +(subtotal + cgst + sgst).toFixed(2);

  doc.fontSize(9)
    .text("1", col.sn, tableTop + 25)
    .text(
      "Promotion Drive\nA comprehensive marketing package to increase brand visibility and customer engagement through targeted campaigns",
      col.desc,
      tableTop + 25,
      { width: 180 }
    )
    .text("1.00", col.qty, tableTop + 25)
    .text("10.00", col.rate, tableTop + 25)
    .text("9%", col.cgstP, tableTop + 25)
    .text("0.90", col.cgstA, tableTop + 25)
    .text("9%", col.sgstP, tableTop + 25)
    .text("0.90", col.sgstA, tableTop + 25)
    .text("10.00", col.amt, tableTop + 25);

  /* ---------------- TOTAL BOX ---------------- */
  const summaryY = 430;

  doc.rect(360, summaryY, 205, 130).stroke();

  doc.fontSize(10)
    .text("Sub Total", 370, summaryY + 10)
    .text("10.00", 520, summaryY + 10, { align: "right" })
    .text("CGST9 (9%)", 370, summaryY + 30)
    .text("0.90", 520, summaryY + 30, { align: "right" })
    .text("SGST9 (9%)", 370, summaryY + 50)
    .text("0.90", 520, summaryY + 50, { align: "right" })
    .text("Total", 370, summaryY + 75)
    .text("₹11.80", 520, summaryY + 75, { align: "right" })
    .text("Payment Made (-)", 370, summaryY + 95)
    .text("11.80", 520, summaryY + 95, { align: "right" })
    .text("Balance Due", 370, summaryY + 115)
    .text("₹0.00", 520, summaryY + 115, { align: "right" });

  /* ---------------- FOOTER ---------------- */
  doc.fontSize(9)
    .text("Total In Words", 40, 450)
    .text("Indian Rupee Eleven and Eighty Paise Only", 40, 465)
    .text("Notes", 40, 495)
    .text("Thanks for your business.", 40, 510);

  doc.text("Authorized Signature", 420, 560);

  doc.end();
};
