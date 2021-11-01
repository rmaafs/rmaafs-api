import express from "express";
import credenciales from "../../../credentials.json";
import PushAndroid from "./PushAndroid";

const SERVER_TOKEN = credenciales.push.android.server_token;
const TOKEN = credenciales.push.android.token;
const SECRET = credenciales.push.android.secret;
const pushAndroid = new PushAndroid(SERVER_TOKEN, TOKEN);

const router = express.Router();

router.get("/", async (req, res) => {
  res.status(200).json({
    mensaje:
      "Esta es mi API REST para mandar notificaciones push en tiempo real a mi celular.",
    rutas: [
      {
        url: "/",
        info: "Mandar mensaje push a mi celular.",
        format: "json",
        method: "POST",
        params: {
          title: "Título del mensaje",
          body: "Cuerpo del mensaje",
        },
      },
    ],
  });
});

router.post("/", async (req, res) => {
  const title = req.body.title;
  const body = req.body.body;
  const secret = req.body.secret;
  if (secret !== SECRET) {
    return res.status(403).json({
      mensaje: "No tienes permiso para hacer esto.",
    });
  }

  if (!title || !body) {
    return res.status(400).json({
      mensaje: "No se recibió el título o mensaje a enviar.",
    });
  }

  const response = await pushAndroid.enviar(title, body);
  res.status(200).json(response);
});

module.exports = router;
