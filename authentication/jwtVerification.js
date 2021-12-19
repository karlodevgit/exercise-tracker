const jwt = require("jsonwebtoken");

const verifyToken = async(req, res, next) => {
    const token = req.headers["x-access-token"];
    if(!token) return res.status(403).send("No token found in the request headers");
    
    try {
        const decoded = jwt.verify(token, "secretkey");
        req.user = decoded._doc;
    } catch (error) {
        return res.status(401).send("Invalid Token");
    }

    return next();
}

module.exports = verifyToken;