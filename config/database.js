



// const con = new Pool({
//   connectionString: "postgresql://postgres.lpkqtxymwbiukzdfsrsi:##root123##@aws-1-ap-south-1.pooler.supabase.com:6543/postgres",
//   ssl: { rejectUnauthorized: false }
// });

// con.on("connect", () => {
//   console.log("Supabase PostgreSQL connected");
// });

// module.exports = con;


const { Pool } = require("pg");

const con = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // REQUIRED on Render
});

con.on("connect", () => {
  console.log("NeoN PostgreSQL connected");
});

con.on("error", (err) => {
  console.error(" DB error:", err);
  process.exit(1);
});

module.exports = con;

// const { Pool } = require("pg");

// const con = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: { rejectUnauthorized: false }
// });

// con.on("connect", () => {
//   console.log("Supabase PostgreSQL connected");
// });

// module.exports = con;



// const { Pool } = require("pg");

// const con = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: { rejectUnauthorized: false },
//   max: 5,
//   connectionTimeoutMillis: 5000,
//   idleTimeoutMillis: 30000,
//   statement_timeout: 5000
// });

// // VERY IMPORTANT: disable prepared statements
// con.options = "--disable-prepared-statements";

// con.on("connect", () => {
//   console.log("Supabase PostgreSQL connected");
// });

// module.exports = con;
