import express from "express";
import Foco from "./Foco";
import credenciales from "../../../credentials.json";

const SECRET = credenciales.tuya.foco.SECRET;
const router = express.Router();

let foco = new Foco(() => {});

router.get("/", async (req, res) => {
  res.status(200).json({
    mensaje: "Esta es mi API REST para controlar mis los dispositivos IoT :)",
  });
});

//Obtener el status del foco
router.get("/status", async (req, res) => {
  //Se le debe mandar el parámetro secret, y tendrá que ser igual al de las credenciales.
  const secret = req.query.secret || "";
  if (SECRET === secret) {
    const response = await foco.getStatus();
    res.status(200).json(response);
  } else {
    res.status(403).json({
      mensaje: "No tienes permiso para hacer esto.",
    });
  }
});

//Apagar o prender el foco según su estado actual.
router.get("/switch", async (req, res) => {
  //Se le debe mandar el parámetro secret, y tendrá que ser igual al de las credenciales.
  const secret = req.query.secret || "";
  if (SECRET === secret) {
    const response = await foco.switch();
    res.status(200).json(response);
  } else {
    res.status(403).json({
      mensaje: "No tienes permiso para hacer esto.",
    });
  }
});

//Poner el foco en cálido, esto porque al cambiarle el color, se ve diferente el color.
router.get("/calido", async (req, res) => {
  //Se le debe mandar el parámetro secret, y tendrá que ser igual al de las credenciales.
  const secret = req.query.secret || "";
  if (SECRET === secret) {
    const response = await foco.calido();
    res.status(200).json(response);
  } else {
    res.status(403).json({
      mensaje: "No tienes permiso para hacer esto.",
    });
  }
});

//Prender o apagar el foco manualmente.
router.post("/turn", async (req, res) => {
  const secret = req.body.secret;
  const value = req.body.value;
  if (SECRET === secret) {
    const response = await foco.setSwitch(value);
    res.status(200).json(response);
  } else {
    res.status(403).json({
      mensaje: "No tienes permiso para hacer esto.",
    });
  }
});

//Cambiar el color del foco en RGB
router.post("/color", async (req, res) => {
  const secret = req.body.secret;
  const { r, g, b } = req.body;

  if (SECRET === secret) {
    const response = await foco.setColor(r, g, b);
    res.status(200).json(response);
  } else {
    res.status(403).json({
      mensaje: "No tienes permiso para hacer esto.",
    });
  }
});

module.exports = router;
