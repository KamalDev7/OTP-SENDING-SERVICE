const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");

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


app.use(express.json());


app.use("/api/auth", authRoutes);

const port = process.env.PORT || 8001;
app.listen(port, () => {
    console.log(`Server Running on port ${port}`);
});
