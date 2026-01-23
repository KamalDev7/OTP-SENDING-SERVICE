const express = require("express");
const app = express();
const cors = require("cors");
// const cookieParser = require("cookie-parser");

const path = require("path");
require("dotenv").config();



const authRoutes = require("./routers/userAuthRoutes");
const paymentRoutes = require("./routers/subscriptionRoutes");
const userRoutes = require("./routers/userRoutes");

// app.use(cors({
//     origin: "http://localhost:3000",
//     credentials: true
// }));

app.use(cors({
    origin: true,
    credentials: true
}));


app.set("view engine","ejs");
app.set("views",path.resolve("./views"));

app.use(express.json());

app.get("/",(req,res)=>{
    return res.render("Home.ejs");
})

app.use("/api/auth", authRoutes);
app.use("/api/payment",paymentRoutes);
app.use("/api/user",userRoutes);

const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server Running on port ${port}`);
});
