const express = require("express");
const UserController = require("../controllers/user");
const md_auth = require("../middleware/authenticate");

const api = express.Router();

api.post("/sing-up", UserController.singUp);
api.post("/sing-in", UserController.signIn);
api.get("/users", [md_auth.ensureAuth], UserController.getUsers);
api.get("/users-active", [md_auth.ensureAuth], UserController.getUsersActive);

module.exports = api;
