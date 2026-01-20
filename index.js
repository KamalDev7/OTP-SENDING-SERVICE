const express = require("express");
const app = express();
const cors = require("cors");
// const cookieParser = require("cookie-parser");

const path = require("path");
require("dotenv").config();



const authRoutes = require("./routers/userRoutes");

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

const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server Running on port ${port}`);
});
