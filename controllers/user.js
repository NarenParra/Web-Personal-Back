const fs = require("fs");
const path = require("path");
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
    res.status(404).send({ message: "Las contraseñas son obligatorias" });
  } else {
    if (password !== repeatPassword) {
      res.status(404).send({ message: "Las contraseñas deben ser iguales" });
    } else {
      bcrypt.hash(password, null, null, function (err, hash) {
        if (err) {
          res.status(500).send({ message: "error al encriptar contraseña" });
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
            res.status(404).send({ message: "La contraseña es incorrecta" });
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

function uploadAvatar(req, res) {
  const params = req.params;
  User.findById({ _id: params.id }, (err, userData) => {
    if (err) {
      res.status(500).send({ message: "Error del servidor" });
    } else {
      if (!userData) {
        res.status(404).send({ message: "Usuario no encontrado" });
      } else {
        let user = userData;
        if (req.files) {
          let filesPath = req.files.avatar.path;
          let fileSplit = filesPath.split("\\");
          let fileName = fileSplit[2];
          let extSplit = fileName.split(".");
          let fileExt = extSplit[1];

          if (fileExt !== "png" && fileExt !== "jpg") {
            res.status(400).send({
              message: "Extencion no valida. (Extenciones validas .png .jpg)",
            });
          } else {
            user.avatar = fileName;
            User.findByIdAndUpdate(
              { _id: params.id },
              user,
              (err, userResult) => {
                if (err) {
                  res.status(505).send({ message: "Error del servidor" });
                } else {
                  if (!userResult) {
                    res.status(404).send({ message: "Usuario no encontrado" });
                  } else {
                    res.status(200).send({
                      avatarName: fileName,
                    });
                  }
                }
              }
            );
          }
        }
      }
    }
  });
}

function getAvatar(req, res) {
  const avatarName = req.params.avatarName;
  const filePath = "./uploads/avatar/" + avatarName;
  fs.exists(filePath, (exist) => {
    if (!exist) {
      res.status(404).send({ message: "Avatar no dispoible" });
    } else {
      res.sendFile(path.resolve(filePath));
    }
  });
}

async function updateUser(req, res) {
  let userData = req.body;
  userData.email = req.body.email.toLowerCase();
  const params = req.params;

  if (userData.password) {
    await bcrypt.hash(userData.password, null, null, (err, hash) => {
      if (err) {
        res.status(500).send({ message: "Error al encriptar la contraseña" });
      } else {
        userData.password = hash;
      }
    });
  }

  User.findByIdAndUpdate({ _id: params.id }, userData, (err, userUpdate) => {
    if (err) {
      res.status(500).send({ message: "Error del servidor" });
    } else {
      if (!userUpdate) {
        res.status(404).send({ message: "Usuario no encontrado" });
      } else {
        res.status(200).send({ message: "Usuario actualizado correctamente" });
      }
    }
  });
}

function activateUser(req, res) {
  const { id } = req.params;
  const { active } = req.body;

  User.findByIdAndUpdate(id, { active }, (err, userStored) => {
    if (err) {
      res.status(500).send({ message: "Error del servidor" });
    } else {
      if (!userStored) {
        res.status(404).send({ message: "No se ha encontrado el usuario" });
      } else {
        if (active === true) {
          res.status(200).send({ message: "Usuario activado" });
        } else {
          res.status(200).send({ message: "Usuario desactivado" });
        }
      }
    }
  });
}

function deleteUser(req, res) {
  const { id } = req.params;

  User.findByIdAndRemove(id, (err, userDeleted) => {
    if (err) {
      res.status(500).send({ message: "Error del servidor" });
    } else {
      if (!userDeleted) {
        res.status(404).send({ message: "Usuario no encontrado" });
      } else {
        res.status(200).send({ message: "Usuario eliminado conrectamente" });
      }
    }
  });
  console.log("delete user");
}

function singUpAdmin(req, res) {
  const user = new User();

  const { name, lastname, email, role, password } = req.body;

  user.name = name;
  user.lastname = lastname;
  user.email = email.toLowerCase();
  user.role = role;
  user.active = true;

  if (!password) {
    res.status(500).send({ message: "La contraseña es obligatoria" });
  } else {
    bcrypt.hash(password, null, null, (err, hash) => {
      if (err) {
        res.status(500).send({ message: "Error al encriptar la contraseña" });
      } else {
        user.password = hash;

        user.save((err, userStored) => {
          if (err) {
            res.status(500).send({ message: "El usuario ya existe" });
          } else {
            if (!userStored) {
              res.status(404).send({ message: "Error del servidor" });
            } else {
              res.status(200).send({ message: "Usuario creado" });
            }
          }
        });
      }
    });
  }
}

module.exports = {
  singUp,
  signIn,
  getUsers,
  getUsersActive,
  uploadAvatar,
  getAvatar,
  updateUser,
  activateUser,
  deleteUser,
  singUpAdmin,
};
