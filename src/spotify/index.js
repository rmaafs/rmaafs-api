const express = require("express");
const router = express.Router();
import { Spotify } from "./Spotify";

router.get("/", async (req, res) => {
  const sp = new Spotify();
  await sp.refreshToken();

  /*res.status(200).json({
    mensaje: "Esta es mi API REST para saber información de mi Spotify :)",
  });*/

  res.status(200).json({
    token: sp,
  });
});

module.exports = router;
