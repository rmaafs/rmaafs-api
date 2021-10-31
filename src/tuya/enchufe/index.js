import express from "express";
import credenciales from "../../../credentials.json";

const SECRET = credenciales.tuya.enchufe.SECRET;
const router = express.Router();

router.get("/", async (req, res) => {
  res.status(200).json({
    mensaje: "Esta es mi API REST para controlar mis los dispositivos IoT :)",
  });
});

module.exports = router;
