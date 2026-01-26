const con = require("../config/database");

exports.registerBusiness = async (req, res) => {
  try {
    const { email, business_name, business_address } = req.body;

    if (!email || !business_name || !business_address) {
      return res.status(400).json({
        message: "email, business_name and business_address are required"
      });
    }

    //  Get user + role
    const userResult = await con.query(
      `
      SELECT 
        u.user_id,
        r.role_name
      FROM users1 u
      JOIN roles r ON r.role_id = u.role_id
      WHERE u.email = $1
      `,
      [email]
    );

    if (userResult.rowCount === 0) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const { user_id, role_name } = userResult.rows[0];

    // Allow only dealers
    if (role_name !== "dealer") {
      return res.status(403).json({
        message: "Only dealers can register a business"
      });
    }

    // Check existing business
    const businessCheck = await con.query(
      "SELECT business_id FROM businesses WHERE dealer_id = $1",
      [user_id]
    );

    if (businessCheck.rowCount > 0) {
      return res.status(409).json({
        message: "Business already registered"
      });
    }

    // Insert business
    const result = await con.query(
      `
      INSERT INTO businesses (dealer_id, business_name, business_address)
      VALUES ($1, $2, $3)
      RETURNING business_id, business_name, business_address
      `,
      [user_id, business_name, business_address]
    );

    res.status(201).json({
      message: "Business registered successfully",
      business: result.rows[0]
    });

    console.log(`Business registered for dealer: ${email}`);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};
