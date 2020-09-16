const express = require("express");
const MenuController = require("../controllers/menu");

const md_auth = require("../middleware/authenticate");

const api = express.Router();

api.post("/add-menu", [md_auth.ensureAuth], MenuController.addMenu);
api.get("/get-menus", MenuController.getMenus);
api.put(
  "/update-menu/:id",
  [md_auth.ensureAuth],
  MenuController.updateMenuOrder
);
api.put(
  "/activate-menu/:id",
  [md_auth.ensureAuth],
  MenuController.ActivateMenu
);
module.exports = api;
