import express from "express";
import Heart from "./heart";

const router = express.Router();
const heart = new Heart();

router.get("/", async (req, res) => {
  res.status(200).json({
    mensaje:
      "Esta es mi API REST para obtener tiempo real sobre mi cuerpo. Lo uso para cosas interesantes personales.",
    rutas: [
      {
        url: "/heart",
        info: "Obtener la última actualización de mi frecuencia cardiaca.",
        format: "json",
        method: "GET",
      },
    ],
  });
});

router.get("/heart", async (req, res) => {
  const rate = await heart.getLastRate();
  res.status(200).json(rate);
});

module.exports = router;
