const con = require("../config/database");

exports.getAllUsers = async (req, res) => {
    try {
        const response = await con.query(
            "SELECT * FROM users1"
        );

        if (response.rowCount > 0) {
            res.status(200).json({
                users: response.rows
            });
        }
        console.log(`All user got !`);

    } catch (err) {
        console.log(err);
    }
}


exports.changeUserRole = async (req, res) => {
  try {
    const { email, role_name } = req.body;

    if (!email || !role_name) {
      return res.status(400).json({
        message: "email and role_name are required"
      });
    }

    const roleResult = await con.query(
      "SELECT role_id FROM roles WHERE role_name = $1",
      [role_name]
    );

    if (roleResult.rowCount === 0) {
      return res.status(400).json({
        message: "Invalid role"
      });
    }

    const role_id = roleResult.rows[0].role_id;

    const updateResult = await con.query(
      "UPDATE users1 SET role_id = $1 WHERE email = $2",
      [role_id, email]
    );

    if (updateResult.rowCount === 0) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    console.log(`User role changed to '${role_name}', Email: ${email}`);

    res.status(200).json({
      message: "User role updated successfully",
      email,
      role: role_name
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};



exports.getDealersPermissions = async (req, res) => {
  try {
    const { role_name } = req.body;

    if (!role_name) {
      return res.status(400).json({
        message: "role_name is required"
      });
    }

    const result = await con.query(
      `
      SELECT 
        r.role_name,
        rp.can_create,
        rp.can_update,
        rp.can_delete,
        rp.can_read,
        rp.can_add_staff
      FROM roles r
      JOIN role_permissions rp
        ON rp.role_id = r.role_id
      WHERE r.role_name = $1
      `,
      [role_name]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Role or permissions not found"
      });
    }

    res.status(200).json({
      role: role_name,
      permissions: result.rows[0],
      message: "Role permissions fetched successfully"
    });

    console.log(`Fetched permissions for role '${role_name}'`);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};


exports.grantPermissionToDealer = async (req, res) => {

    try {

        const { role, can_read, can_add_staff, can_create, can_update, can_delete } = req.body;

    } catch (err) {

    }

}