const jwt = require("jwt-simple");
const moment = require("moment");

const SECRET_KEY = "N87cf52jqeRT88laA2c44";

exports.ensureAuth = (req, res, next) => {
  if (!req.headers.authorization) {
    res
      .status(403)
      .send({ message: "La peticion no tiene cabecera de autenticacion" });
  }

  const token = req.headers.authorization.replace(/['"]+/g, "");

  try {
    var payload = jwt.decode(token, SECRET_KEY);
    if (payload.exp <= moment.unix()) {
      return res.status(404).send({ message: "el token ha expitado" });
    }
  } catch (ex) {
    //console.log(ex)
    return res.status(404).send({ message: "Token invalido" });
  }

  req.user = payload;
  next();
};
