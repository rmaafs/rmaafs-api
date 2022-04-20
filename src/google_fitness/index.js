import express from "express";

const router = express.Router();

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
  res.status(200).json({ msg: "ok" });
});

module.exports = router;
