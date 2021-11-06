const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "secrets.env"),
});

const app = express().use(cors()).use(express.json()); //Crea al servidor
const port = process.env.PORT || 20202; //Puerto donde abriremos el servicio

//Ruta GET / para saber si el servicio está corriendo
app.get("/", (req, res) => {
  res.status(200).json({
    message: "¡Hola! Esta es mi API REST para obtener información sobre mi :)",
    rutas: [
      {
        url: "/spotify",
        info: "Información sobre mi Spotify.",
      },
      {
        url: "/foco",
        info: "Controlar el foco WiFi de mi cuarto.",
      },
      {
        url: "/enchufe",
        info: "Controlar el enchufe WiFi de mi cuarto.",
      },
      {
        url: "/push",
        info: "Mandar notificaciones push en tiempo real a mi celular.",
      },
    ],
  });
});

//Rutas para spotify
app.use("/spotify", require("./src/spotify"));

//Rutas para controlar mi foco
app.use("/foco", require("./src/tuya/foco"));

//Rutas para controlar mi enchufe
app.use("/enchufe", require("./src/tuya/enchufe"));

//Rutas para mandar mensajes PUSH a mi celular
app.use("/push", require("./src/push/android"));

app.listen(port, () => {
  console.log("Escuchando en el puerto " + port);
});
