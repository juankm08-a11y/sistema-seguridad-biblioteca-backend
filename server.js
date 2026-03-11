require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const nodemailer = require("nodemailer");
const { verificarToken, permitirRoles } = require("./authMiddleware");

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.options("*", cors());
const usuarios = [
  {
    id: 1,
    email: "juancarlospabon01@gmail.com",
    password: "123",
    tol: "admin",
    code2fa: null,
    refreshToken: null,
  },
  {
    id: 2,
    email: "munozpabonjuancarlos2@gmail.com",
    password: "123",
    rol: "estudiante",
    code2fa: null,
    refreshToken: null,
  },
];

const librosPrestados = ["Don Quijote", "Cien años de soledad"];

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.get("/login-paso1", async (req, res) => {
  const { email, password } = req.body;
  const user = usuarios.find(
    (u) => u.email === email && u.password === password,
  );

  if (!user)
    return res.status(401).json({ mensaje: "Credenciales incorrectas" });

  const code = Math.floor(1000 + Math.random() * 9000).toString();

  user.code2fa = code;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Ingresa tu código de seguridad",
    text: `Tu código es: ${code}`,
  });

  res.json({ mensaje: "Codigo enviado al correo" });
});

app.post("/login-paso2", (req, res) => {
  const { email, code } = req.body;
  const user = usuarios.find((u) => u.email === email && u.code2fa === code);

  if (!user) return res.status(401).json({ mensaje: "Código incorrecto" });

  const accessToken = jwt.sign(
    { id: user.id, rol: user.rol },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "2h" },
  );

  user.refreshToken = refreshToken;
  user.code2fa = null;

  res.json({ accessToken, refreshToken });
});

app.get(
  "/mi-espacio",
  verificarToken,
  permitirRoles("estudiante"),
  (req, res) => {
    res.json({ libros: librosPrestados });
  },
);

app.get("/refresh-token", (req, res) => {
  const { token } = req.body;
  if (!token) return res.sendStatus(401);

  const user = usuarios.find((u) => u.refreshToken === token);
  if (!user) return res.sendStatus(403);

  jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err) => {
    if (err) return res.sendStatus(403);

    const newAccessToken = jwt.sign(
      { id: user.id, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.json({ accessToken: newAccessToken });
  });
});

app.listen(process.env.PORT, () => console.log("Servidor corriendo"));
