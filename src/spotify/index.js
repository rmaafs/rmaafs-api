const express = require("express");
const router = express.Router();
import { Spotify } from "./Spotify";

const sp = new Spotify();

router.get("/", async (req, res) => {
  res.status(200).json({
    mensaje: "Esta es mi API REST para saber información de mi Spotify :)",
    rutas: [
      {
        url: "/current-track",
        info: "Obtener cual canción estoy reproduciendo ahora mismo",
      },
      {
        url: "/queue",
        info: "Añadir una canción a mi lista de espera",
        format: "json",
        params: {
          track: "ID de Spotify de la canción",
        },
      },
    ],
  });
});

router.get("/current-track", async (req, res) => {
  const track = await sp.getCurrentTrack();

  res.status(200).json(track);
});

router.post("/queue", async (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const idTrack = req.body.track;
  const response = await sp.addQueueTrack(idTrack, ip);

  res.status(200).json(response);
});

module.exports = router;
