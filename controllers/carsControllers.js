
const con = require("../config/database");

exports.getDealerCars = async (req, res) => {
  try {
    const { email } = req.body;
    
    const dealerResult = await con.query(
      `
      SELECT u.user_id
      FROM users1 u
      JOIN roles r ON r.role_id = u.role_id
      WHERE u.email = $1 AND r.role_name = 'dealer'
      `,
      [email]
    );

    if (dealerResult.rowCount === 0) {
      return res.status(403).json({ message: "Not a dealer" });
    }
    
    const dealer_id = dealerResult.rows[0].user_id;

    const cars = await con.query(
      `
      SELECT car_id, car_name, car_model, price, created_at
      FROM cars
      WHERE dealer_id = $1
      ORDER BY created_at DESC
      `,
      [dealer_id]
    );
    
    res.json({ cars: cars.rows });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


exports.updateCar = async (req, res) => {
  try {
    const { car_id, email, car_name, car_model, price } = req.body;
    
    const dealer = await con.query(
      `SELECT user_id FROM users1 WHERE email=$1`,
      [email]
    );
    
    const dealer_id = dealer.rows[0].user_id;
    
    const result = await con.query(
      `
      UPDATE cars
      SET car_name=$1, car_model=$2, price=$3
      WHERE car_id=$4 AND dealer_id=$5
      RETURNING *
      `,
      [car_name, car_model, price, car_id, dealer_id]
    );
    
    if (result.rowCount === 0) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json({ car: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


exports.deleteCar = async (req, res) => {
  try {
    const { car_id, email } = req.body;
    
    const dealer = await con.query(
      `SELECT user_id FROM users1 WHERE email=$1`,
      [email]
    );
    
    const dealer_id = dealer.rows[0].user_id;
    
    const result = await con.query(
      `DELETE FROM cars WHERE car_id=$1 AND dealer_id=$2`,
      [car_id, dealer_id]
    );
    
    if (result.rowCount === 0) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    res.json({ message: "Car deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllCars = async (req, res) => {
  try {
    const result = await con.query(
      `
      SELECT
        c.car_id,
        c.car_name,
        c.car_model,
        c.price,
        c.created_at,
        
        b.business_name,
        b.business_address,
        
        u.full_name AS dealer_name,
        u.phone AS dealer_phone
        
        FROM cars c
        JOIN businesses b
        ON b.business_id = c.business_id
      JOIN users1 u
      ON u.user_id = c.dealer_id
      ORDER BY c.created_at DESC
      `
    );

    res.status(200).json({
      cars: result.rows
    });
    
    console.log("All cars fetched for explore page");
    
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};

exports.addCar = async (req, res) => {
  try {
    const { email, car_name, car_model, price } = req.body;

    if (!email || !car_name || !price) {
      return res.status(400).json({
        message: "email, car_name and price are required"
      });
    }

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

    if (role_name !== "dealer") {
      return res.status(403).json({
        message: "Only dealers can add cars"
      });
    }

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