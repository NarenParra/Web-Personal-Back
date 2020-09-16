const Menu = require("../models/menu");
const { use } = require("../routers/menu");

function addMenu(req, res) {
  const { title, url, order, active } = req.body;
  const menu = new Menu();

  menu.title = title;
  menu.url = url;
  menu.order = order;
  menu.active = active;

  menu.save((err, createMenu) => {
    if (err) {
      res.status(500).send({ message: "Error del servidor" });
    } else {
      if (!createMenu) {
        res.status(404).send({ message: "Eror al crear el menu" });
      } else {
        res.status(200).send({ message: "Menu creado correctamente" });
      }
    }
  });
}

function getMenus(req, res) {
  Menu.find()
    .sort({ order: "asc" })
    .exec((err, menuStored) => {
      if (err) {
        res.status(500).send({ message: "Error del servidor" });
      } else {
        if (!menuStored) {
          res.status(404).send({ message: "No se han encontrado registros" });
        } else {
          res.status(200).send({ menu: menuStored });
        }
      }
    });
}

function updateMenuOrder(req, res) {
  let menuData = req.body;
  const params = req.params;

  Menu.findByIdAndUpdate(params.id, menuData, (err, menuUpadate) => {
    if (err) {
      res.status(500).send({ message: "Error del servidor" });
    } else {
      if (!menuUpadate) {
        res.status(404).send({ message: "Menu no encontrado" });
      } else {
        res.status(200).send({ message: "Menu actualizado" });
      }
    }
  });
}

function ActivateMenu(req, res) {
  const { id } = req.params;
  const { active } = req.body;

  Menu.findByIdAndUpdate(id, { active }, (err, menuUpadate) => {
    if (err) {
      res.status(500).send({ message: "Error del servidor" });
    } else {
      if (!menuUpadate) {
        res.status(404).send({ message: "Menu no encontrado" });
      } else {
        if (active === true) {
          res.status(200).send({ message: "Menu activado correctamente" });
        } else {
          res.status(200).send({ message: "Menu desactivado correctamente" });
        }
      }
    }
  });
}

module.exports = {
  addMenu,
  getMenus,
  updateMenuOrder,
  ActivateMenu,
};
