const bcrypt = require("bcrypt-nodejs");
const User = require("../models/user");
const jwt = require("../services/jwt");
const user = require("../models/user");

function singUp(req, res) {
  const user = new User();

  const { name, lastName, email, password, repeatPassword } = req.body;
  user.name = name;
  user.lastName = lastName;
  user.email = email.toLowerCase();
  user.role = "admin";
  user.active = false;

  if (!password || !repeatPassword) {
    res.status(404).send({ message: "Las contrasenias son obligatorias" });
  } else {
    if (password !== repeatPassword) {
      res.status(404).send({ message: "Las contrasenias deben ser iguales" });
    } else {
      bcrypt.hash(password, null, null, function (err, hash) {
        if (err) {
          res.status(500).send({ message: "error al encriptar contrasenia" });
        } else {
          user.password = hash;

          user.save((err, userStored) => {
            if (err) {
              res.status(500).send({ message: "Error, el usuario ya existe " });
            } else {
              if (!userStored) {
                res.status(404).send({ message: "error al creact usuario" });
              } else {
                res.status(200).send({ user: userStored });
              }
            }
          });
        }
      });
    }
  }
}

function signIn(req, res) {
  const params = req.body;
  const email = params.email.toLowerCase();
  const password = params.password;

  User.findOne({ email }, (err, userStored) => {
    if (err) {
      res.status(500).send({ message: "Error del servidor" });
    } else {
      if (!userStored) {
        res.status(404).send({ message: "Usuario no encontrado" });
      } else {
        console.log(userStored);
        bcrypt.compare(password, userStored.password, (err, check) => {
          if (err) {
            res.status(500).send({ message: "Error del servidor" });
          } else if (!check) {
            res.status(404).send({ message: "La contrasenia es incorrecta" });
          } else {
            if (!userStored.active) {
              res.status(200).send({ message: "El usuario no esta activo" });
            } else {
              res.status(200).send({
                accessToken: jwt.createAccessToken(userStored),
                refreshToken: jwt.createRefreshToken(userStored),
              });
            }
          }
        });
      }
    }
  });
}

function getUsers(req, res) {
  User.find().then((users) => {
    if (!users) {
      res.status(404).send({ message: "No hay Usuarios" });
    } else {
      res.status(200).send({ users });
    }
  });
}

function getUsersActive(req, res) {
  const query = req.query;

  User.find({ active: query.active }).then((users) => {
    if (!users) {
      res.status(404).send({ message: "No hay Usuarios" });
    } else {
      res.status(200).send({ users });
    }
  });
}

module.exports = {
  singUp,
  signIn,
  getUsers,
  getUsersActive,
};
