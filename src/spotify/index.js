const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res
    .status(200)
    .json({
      mensaje: "Esta es mi API REST para saber información de mi Spotify :)",
    });
});

module.exports = router;
