const express = require("express");
const cors = require("cors");

const app = express().use(cors()).use(express.json()); //Crea al servidor
const port = process.env.PORT || 20202; //Puerto donde abriremos el servicio

//Ruta GET / para saber si el servicio está corriendo
app.get("/", (req, res) => {
  res.status(200).json({ message: "Works!" });
});

const server = app.listen(port, () => {
  console.log("Escuchando en el puerto " + port);
});
