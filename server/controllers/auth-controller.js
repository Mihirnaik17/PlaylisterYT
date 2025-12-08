const auth = require('../auth')
const dbManager = require('../db')
const bcrypt = require('bcryptjs')

getLoggedIn = async (req, res) => {
    try {
        let userId = auth.verifyUser(req);
        if (!userId) {
            return res.status(200).json({
                loggedIn: false,
                user: null,
                errorMessage: "?"
            })
        }

        const loggedInUser = await dbManager.getUserById(userId);
        console.log("loggedInUser: " + loggedInUser);

        return res.status(200).json({
            loggedIn: true,
            user: {
                firstName: loggedInUser.firstName,
                lastName: loggedInUser.lastName,
                username: loggedInUser.username,
                email: loggedInUser.email,
                avatar: loggedInUser.avatar
            }
        })
    } catch (err) {
        console.log("err: " + err);
        res.json(false);
    }
}

loginUser = async (req, res) => {
    console.log("loginUser");
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ errorMessage: "Please enter all required fields." });
        }

        const existingUser = await dbManager.getUserByEmail(email);
        console.log("existingUser: " + existingUser);
        if (!existingUser) {
            return res
                .status(401)
                .json({
                    errorMessage: "Wrong email or password provided."
                })
        }

        console.log("provided password: " + password);
        const passwordCorrect = await bcrypt.compare(password, existingUser.passwordHash);
        if (!passwordCorrect) {
            console.log("Incorrect password");
            return res
                .status(401)
                .json({
                    errorMessage: "Wrong email or password provided."
                })  
        }

        const token = auth.signToken(existingUser.id || existingUser._id);
        console.log(token);

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: true
        }).status(200).json({
            success: true,
            user: {
                firstName: existingUser.firstName,
                lastName: existingUser.lastName,
                username: existingUser.username,  
                email: existingUser.email,
                avatar: existingUser.avatar
            }
        })

    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
}

logoutUser = async (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0),
        secure: true,
        sameSite: "none"
    }).send();
}

registerUser = async (req, res) => {
    console.log("REGISTERING USER IN BACKEND");
    try {
        const { firstName, lastName, username, email, password, passwordVerify, avatar } = req.body;
        console.log("create user: " + firstName + " " + lastName + " " + email + " " + password + " " + passwordVerify);
        if (!firstName || !lastName || !email || !username|| !password || !passwordVerify) {
            return res
                .status(400)
                .json({ errorMessage: "Please enter all required fields." });
        }
        console.log("all fields provided");
        if (password.length < 8) {
            return res
                .status(400)
                .json({
                    errorMessage: "Please enter a password of at least 8 characters."
                });
        }
        console.log("password long enough");
        if (password !== passwordVerify) {
            return res
                .status(400)
                .json({
                    errorMessage: "Please enter the same password twice."
                })
        }
        console.log("password and password verify match");
        const existingUser = await dbManager.getUserByEmail(email);
        console.log("existingUser: " + existingUser);
        if (existingUser) {
            return res
                .status(400)
                .json({
                    success: false,
                    errorMessage: "An account with this email address already exists."
                })
        }

        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const passwordHash = await bcrypt.hash(password, salt);
        console.log("passwordHash: " + passwordHash);

        const savedUser = await dbManager.createUser({firstName, lastName, username, email, passwordHash, avatar});
        console.log("new user saved: " + (savedUser.id || savedUser._id));

        return res.status(200).json({
            success: true
        })

    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
}

editUser = async (req, res) => {
    console.log("EDITING USER IN BACKEND");
    try {
        const userId = auth.verifyUser(req);
        if (!userId) {
            return res.status(401).json({
                success: false,
                errorMessage: "Unauthorized"
            });
        }

        const { username, password, passwordVerify, avatar } = req.body;

        if (!username) {
            return res
                .status(400)
                .json({ errorMessage: "Please enter all required fields." });
        }

        const user = await dbManager.getUserById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                errorMessage: "User not found"
            });
        }

        user.username = username;

        if (avatar !== undefined) {
            user.avatar = avatar;
        }

        if (password || passwordVerify) {
            if (!password || !passwordVerify) {
                return res
                    .status(400)
                    .json({
                        errorMessage: "Please enter the same password twice."
                    });
            }
            if (password.length < 8) {
                return res
                    .status(400)
                    .json({
                        errorMessage: "Please enter a password of at least 8 characters."
                    });
            }
            if (password !== passwordVerify) {
                return res
                    .status(400)
                    .json({
                        errorMessage: "Please enter the same password twice."
                    });
            }

            const saltRounds = 10;
            const salt = await bcrypt.genSalt(saltRounds);
            const passwordHash = await bcrypt.hash(password, salt);
            user.passwordHash = passwordHash;
        }

        const savedUser = await user.save();
        console.log("user updated: " + (savedUser.id || savedUser._id));

        return res.status(200).json({
            success: true,
            user: {
                firstName: savedUser.firstName,
                lastName: savedUser.lastName,
                username: savedUser.username,
                email: savedUser.email,
                avatar: savedUser.avatar
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
}

module.exports = {
    getLoggedIn,
    registerUser,
    loginUser,
    logoutUser,
    editUser
}
