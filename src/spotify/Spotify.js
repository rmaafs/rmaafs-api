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
    this.tokenExpires = 0; //¿Cuando expirará el token que tenemos? Sino para generar otro
    this.queued = {};
  }

  /**
   * Función para obtener el token mediante un refresh_token
   * @returns Retornará el nuevo token
   */
  async refreshToken() {
    return new Promise((resolve, reject) => {
      //Primero verificamos que el token que generamos previamente sea vigente, sino generamos otro
      if (Date.now() < this.tokenExpires) {
        resolve(this.access_token);
        return;
      }

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
            this.tokenExpires =
              (Number(data.expires_in) - 10) * 1000 + Date.now();
            resolve(data.access_token);
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * Función que nos dirá que canción está escuchando Rodriguito
   * @returns Retornará un objeto con la información
   */
  async getCurrentTrack() {
    await this.refreshToken();
    return new Promise((resolve, reject) => {
      axios({
        method: "GET",
        url: this.API_URL + "/me/player/currently-playing",
        headers: {
          Authorization: "Bearer " + this.access_token,
        },
      })
        .then(({ data }) => {
          //Si la respuesta no contiene la información del track...
          if (!data.item) reject("No se pudo recuperar el current track");

          const progress = data.progress_ms; //En qué segundo va la canción
          const isPlaying = data.is_playing; //¿Está reproduciendo?

          const item = data.item;
          const duration = item.duration_ms; //Duración de la canción
          const urlCancion = item.external_urls.spotify; //URL para compartir
          const id = item.id; //ID de la canción
          const name = item.name; //Nombre de la canción
          const artista = item.artists[0].name; //Solo mostrar el primer artista
          const image = item.album.images[0];

          //Preparamos el objeto de respuesta
          const respuesta = {
            progress: progress,
            is_playing: isPlaying,
            duration: duration,
            url: urlCancion,
            id: id,
            name: name,
            artista: artista,
            image: image,
          };

          resolve(respuesta);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * Función que añadirá una canción a la lista de reproducción
   * @param {string} idTrack ID del track a añadir
   * @param {string} ip IP del usuario
   * @returns Retornará un objeto con la información
   */
  async addQueueTrack(idTrack, ip) {
    await this.refreshToken();
    return new Promise((resolve, reject) => {
      const fecha = new Date().toISOString().slice(0, 10);

      //Verificamos si el día sigue siendo el mismo
      if (!this.queued[fecha]) {
        this.queued = {}; //Limpiar RAM ya que cambió de día
        this.queued[fecha] = [];
      }

      //Si una IP ya ha solicitado poner una canción
      if (this.queued[fecha].includes(ip)) {
        resolve({ error: "Sólo puedes añadir 1 canción por día." });
        return;
      }

      axios({
        method: "POST",
        url: this.API_URL + "/me/player/queue?uri=spotify%3Atrack%3A" + idTrack,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + this.access_token,
        },
      })
        .then(({ data }) => {
          if (data === "") {
            this.queued[fecha].push(ip);
            resolve({ status: "ok" });
          }
          resolve({ error: "No se pudo añadir la canción." });
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  async searchTrack(search) {
    await this.refreshToken();
    return new Promise((resolve, reject) => {
      axios({
        method: "GET",
        url: this.API_URL + "/search?type=track&limit=1&q=" + search,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + this.access_token,
        },
      })
        .then(({ data }) => {
          if (data.tracks) {
            const item = data.tracks.items[0];
            const duration = item.duration_ms; //Duración de la canción
            const urlCancion = item.external_urls.spotify; //URL para compartir
            const id = item.id; //ID de la canción
            const name = item.name; //Nombre de la canción
            const artista = item.artists[0].name; //Solo mostrar el primer artista
            const image = item.album.images[0];

            //Preparamos el objeto de respuesta
            const respuesta = {
              duration: duration,
              url: urlCancion,
              id: id,
              name: name,
              artista: artista,
              image: image,
            };

            resolve(respuesta);
          } else {
            resolve({ error: "No se encontró la canción" });
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}

module.exports = { Spotify };
