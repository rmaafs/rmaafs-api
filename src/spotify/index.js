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
    ],
  });
});

router.get("/current-track", async (req, res) => {
  const track = await sp.getCurrentTrack();

  res.status(200).json(track);
});

module.exports = router;
