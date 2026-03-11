require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.json());

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

app.get("/login", (req, res) => {
  console.log("Inicio de sesión exitoso.");
});
