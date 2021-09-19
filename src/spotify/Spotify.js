const axios = require("axios");
const url = require("url");
import credentials from "../../credentials.json";

/**
 * Clase para la conexión a spotify
 */
class Spotify {
  constructor() {
    this.API_URL = "https://api.spotify.com/v1";
    this.BASIC_AUTH = credentials.spotify.basic;
  }

  /**
   * Función para obtener el token mediante un refresh_token
   * @returns Retornará el nuevo token
   */
  async refreshToken() {
    return new Promise((resolve, reject) => {
      const data = {
        grant_type: "refresh_token",
        refresh_token: credentials.spotify.refresh_token,
      };

      axios({
        method: "POST",
        url: "https://accounts.spotify.com/api/token",
        headers: {
          Authorization: "Basic " + credentials.spotify.basic,
        },
        data: new url.URLSearchParams(data).toString(),
      })
        .then(({ data }) => {
          if (data.access_token) {
            this.access_token = data.access_token;
            resolve(data.access_token);
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}

module.exports = { Spotify };
