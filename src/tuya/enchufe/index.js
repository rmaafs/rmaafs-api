import express from "express";
import Enchufe from "./Enchufe";

const SECRET = process.env.TUYA_SECRET;
const router = express.Router();

const enchufe = new Enchufe(() => {});

router.get("/", async (req, res) => {
  res.status(200).json({
    mensaje: "Esta es mi API REST para controlar mis los dispositivos IoT :)",
    rutas: [
      {
        url: "/status",
        info: "Obtener el estatus del dispositivo.",
        method: "GET",
      },
      {
        url: "/switch",
        info: "Prender o apagar el dispositivo según su estado actual.",
        method: "GET",
      },
      {
        url: "/turn",
        info: "Prender o apagar manualmente el dispositivo.",
        format: "json",
        method: "POST",
        params: {
          value: "true | false",
        },
      },
    ],
  });
});

//Obtener el status del enchufe
router.get("/status", async (req, res) => {
  //Se le debe mandar el parámetro secret, y tendrá que ser igual al de las credenciales.
  const secret = req.query.secret || "";
  if (SECRET === secret) {
    const response = await enchufe.getStatus();
    res.status(200).json(response);
  } else {
    res.status(403).json({
      mensaje: "No tienes permiso para hacer esto.",
    });
  }
});

//Apagar o prender el enchufe según su estado actual.
router.get("/switch", async (req, res) => {
  //Se le debe mandar el parámetro secret, y tendrá que ser igual al de las credenciales.
  const secret = req.query.secret || "";
  if (SECRET === secret) {
    const response = await enchufe.switch();
    res.status(200).json(response);
  } else {
    res.status(403).json({
      mensaje: "No tienes permiso para hacer esto.",
    });
  }
});

//Prender o apagar el enchufe manualmente.
router.post("/turn", async (req, res) => {
  const secret = req.body.secret;
  const value = req.body.value;
  if (SECRET === secret) {
    const response = await enchufe.setSwitch(value);
    res.status(200).json(response);
  } else {
    res.status(403).json({
      mensaje: "No tienes permiso para hacer esto.",
    });
  }
});

module.exports = router;
