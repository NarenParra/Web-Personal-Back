const jwt = require("jwt-simple");
const moment = require("moment");

const SECRET_KEY = "N87cf52jqeRT88laA2c44";

exports.createAccessToken = function (user) {
  const payload = {
    id: user._id,
    name: user.name,
    lastname: user.lastname,
    email: user.email,
    rol: user.role,
    createToken: moment().unix(),
    exp: moment().add(3, "hour").unix(),
  };

  return jwt.encode(payload, SECRET_KEY);
};

exports.createRefreshToken = function (user) {
  const payload = {
    id: user._id,
    exp: moment().add(30, "days").unix(),
  };
  return jwt.encode(payload, SECRET_KEY);
};

exports.decodeToken = function (token) {
  return jwt.decode(token, SECRET_KEY, true);
};
