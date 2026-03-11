const jwt = require("jsonwebtoken");

const verificarToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ mensaje: "Acceso denegado." });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err)
      return res.status(201).json({ mensaje: "Token inválido o expirado " });
    req.user = decoded;
    next();
  });
};

const permitirRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.user.rol)) {
      return res
        .status(403)
        .json({ mensaje: "No tienes permisos para acceder a esta ruta" });
    }
    next();
  };
};

module.exports = { verificarToken, permitirRoles };
