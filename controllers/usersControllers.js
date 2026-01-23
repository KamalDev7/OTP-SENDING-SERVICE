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


exports.getUserStatus = async (req, res) => {
    try {
        const { email } = req.params;

        const response = await con.query(
            "SELECT status FROM users1 WHERE email=$1",
            [email]
        );

        if (response.rowCount > 0) {
            res.status(200).json({
                status: response.rows[0].status,
            });
        }
        console.log(`Uer ststus:: ${response.rows[0].status}`);

    } catch (err) {
        console.log(err);
    }
}

exports.setUserStatus = async (req, res) => {
    try {
        const { email, status } = req.body;

        const response = await con.query(
            "UPDATE users1 set status=$1 where email=$2",
            [status, email]
        );

        if (response.rowCount === 0) {
            res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "User status updated successfully",
            email
        });

        console.log(`User status changed to '${status}', Email: ${email}`);

    } catch (err) {
        console.log(err);
    }
}

exports.changeUserRole = async (req, res) => {
    try {
        const { email,role } = req.body;

        const response =
            await con.query(
                "update users1 set role=$1 where email=$2",
                [role,email]
            );

        if (response.rowCount === 0) {
            res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "User role updated successfully",
            email
        });

        console.log(`User role changed to '${role}' , Email: ${email}`);

    } catch (err) {
        console.log(err);
    }
}


