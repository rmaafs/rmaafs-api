import express from "express";
import Foco from "./Foco";

const SECRET = process.env.TUYA_SECRET;
const router = express.Router();

let foco = new Foco(() => {});

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
        url: "/calido",
        info: "Poner el foco en cálido, esto porque al cambiarle el color, se ve diferente el color.",
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
      {
        url: "/color",
        info: "Cambiar el color del foco en RGB.",
        format: "json",
        method: "POST",
        params: {
          r: "r",
          g: "g",
          b: "b",
        },
      },
    ],
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
