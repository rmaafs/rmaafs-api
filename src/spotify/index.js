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
        method: "GET",
      },
      {
        url: "/search?q=nombre de cancion o artista",
        info: "Obtener una búsqueda de una canción",
        method: "GET",
      },
      {
        url: "/queue",
        info: "Añadir una canción a mi lista de espera",
        format: "json",
        method: "POST",
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

router.get("/search", async (req, res) => {
  const search = req.query.q;
  const track = await sp.searchTrack(search);

  res.status(200).json(track);
});

router.post("/queue", async (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const idTrack = req.body.track;
  const response = await sp.addQueueTrack(idTrack, ip);

  res.status(200).json(response);
});

module.exports = router;
