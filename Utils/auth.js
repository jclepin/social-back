const jwt = require("jsonwebtoken");

const jwt_secret = process.env.JWT_SECRET;

const createToken = (payload) => {
  return jwt.sign(payload, jwt_secret, {
    expiresIn: "1h",
  });
};

exports.createToken = createToken;
