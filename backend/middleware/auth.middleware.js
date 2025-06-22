const jwt  = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Get the token from the Authorization header

    if (token == null) {
        return res.status(401).json({ message: 'No token provided' }); // Unauthorized
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' }); // Forbidden
        }
        req.user = user; // Attach the user information to the request object
        next(); // Call the next middleware or route handler
    });
}

// Export the middleware function so it can be used in other files
module.exports = authenticateToken;