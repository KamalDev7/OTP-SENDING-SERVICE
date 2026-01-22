const { Pool } = require("pg");

const con = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } 
});

con.on("connect", () => {
  console.log("NeoN PostgreSQL connected");
});

con.on("error", (err) => {
  console.error(" DB error:", err);
  process.exit(1);
});

module.exports = con;
