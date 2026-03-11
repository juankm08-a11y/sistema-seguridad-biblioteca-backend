require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.json());

app.get("/login", (req, res) => {
  console.log("Inicio de sesión exitoso.");
});
