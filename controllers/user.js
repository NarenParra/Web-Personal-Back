const bcrypt = require("bcrypt-nodejs");
const user = require("../models/user");

function singUp(req, res) {
  console.log("End point  singUp");
}

module.exports = {
  singUp,
};
