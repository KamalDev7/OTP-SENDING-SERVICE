const con = require("../config/database");


exports.addCar = async (req, res) => {
  try {
    const { email, car_name, car_model, price } = req.body;

    if (!email || !car_name || !price) {
      return res.status(400).json({
        message: "email, car_name and price are required"
      });
    }

    // 1️⃣ Get dealer + role
    const dealerResult = await con.query(
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

    if (dealerResult.rowCount === 0) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const { user_id: dealer_id, role_name } = dealerResult.rows[0];

    // 2️⃣ Allow only dealers
    if (role_name !== "dealer") {
      return res.status(403).json({
        message: "Only dealers can add cars"
      });
    }

    // 3️⃣ Get dealer business
    const businessResult = await con.query(
      `
      SELECT business_id
      FROM businesses
      WHERE dealer_id = $1
      `,
      [dealer_id]
    );

    if (businessResult.rowCount === 0) {
      return res.status(400).json({
        message: "Dealer business not registered"
      });
    }

    const business_id = businessResult.rows[0].business_id;

    // 4️⃣ Insert car
    const result = await con.query(
      `
      INSERT INTO cars (
        dealer_id,
        business_id,
        car_name,
        car_model,
        price
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING car_id, car_name, car_model, price
      `,
      [dealer_id, business_id, car_name, car_model || null, price]
    );

    res.status(201).json({
      message: "Car added successfully",
      car: result.rows[0]
    });

    console.log(`Car added by dealer: ${email}`);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};
