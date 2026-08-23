const jwt = require("jsonwebtoken")

// Tokens (and their cookies) expire after 7 days — a stolen cookie is not valid forever.
const TOKEN_LIFETIME_SECONDS = 7 * 24 * 60 * 60;

function authManager() {
    this.TOKEN_LIFETIME_MS = TOKEN_LIFETIME_SECONDS * 1000;
    this.verify = (req, res, next) => {
        // Skip auth for OPTIONS preflight requests
        if (req.method === 'OPTIONS') {
            return next();
        }

        try {
            const token = req.cookies.token;
            if (!token) {
                return res.status(401).json({
                    loggedIn: false,
                    user: null,
                    errorMessage: "Unauthorized"
                })
            }

            const verified = jwt.verify(token, process.env.JWT_SECRET)
            req.userId = verified.userId;

            next();
        } catch (err) {
            console.error(err);
            return res.status(401).json({
                loggedIn: false,
                user: null,
                errorMessage: "Unauthorized"
            });
        }
    }

    this.verifyUser = (req) => {
        try {
            const token = req.cookies.token;
            if (!token) {
                return null;
            }

            const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
            return decodedToken.userId;
        } catch (err) {
            return null;
        }
    }

    this.signToken = (userId) => {
        return jwt.sign({
            userId: userId
        }, process.env.JWT_SECRET, {
            expiresIn: TOKEN_LIFETIME_SECONDS
        });
    }

    return this;
}

const auth = new authManager();
module.exports = auth;
