// const { Client } = require("pg");

// const con = new Client(
//     {
//         host: process.env.HOST_NAME,
//         user: process.env.DB_USER,
//         port: process.env.DB_PORT,
//         password: process.env.DB_PASSWORD,
//         database: process.env.DB_NAME
//     })

// const con = new Client({
//     connectionString: process.env.DATABASE_URL,
//     ssl: { rejectUnauthorized: false }
// });


// con.connect().then(() => {
//     console.log("DB Connected !");
// });


// module.exports = con;



const { Client } = require("pg");

const con = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

con.connect()
    .then(() => console.log("DB Connected !"))
    .catch(err => {
        console.error("DB Connection Failed:", err.message);
        process.exit(1);
    });

module.exports = con;
