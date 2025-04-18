const axios = require("axios");
const url = require("url");
import PushAndroid from "../push/android/PushAndroid";

const BASIC = process.env.SPOTIFY_BASIC;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

/**
 * Clase para la conexión a spotify
 */
export default class Spotify {
  constructor() {
    this.API_URL = "https://api.spotify.com/v1";
    this.BASIC_AUTH = BASIC;
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
        refresh_token: REFRESH_TOKEN,
      };

      axios({
        method: "POST",
        url: "https://accounts.spotify.com/api/token",
        headers: {
          Authorization: "Basic " + BASIC,
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
          const image = item.album.images[item.album.images.length - 1];

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
        resolve({ error: "You can only recommend 1 song per day." });
        return;
      }

      axios({
        method: "POST",
        url: `${this.API_URL}/me/player/queue?uri=spotify%3Atrack%3A${idTrack}`,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + this.access_token,
        },
      })
        .then(async ({ data }) => {
          if (data === "") {
            return resolve({ error: "No se pudo añadir la canción." });
          }

          this.queued[fecha].push(ip);
          const songName = await this.getTrackNameById(idTrack);
          new PushAndroid().enviar(
            "Canción recomendada",
            `${songName} (${ip})`
          );

          return resolve({ status: "ok" });
        })
        .catch((err) => {
          return reject(err);
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
            const image = item.album.images[item.album.images.length - 1];

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

  async getTrackNameById(trackId) {
    await this.refreshToken();
    return new Promise((resolve, reject) => {
      axios({
        method: "GET",
        url: `${this.API_URL}/tracks/${trackId}`,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + this.access_token,
        },
      })
        .then(({ data }) => {
          if (data && data.name) {
            resolve(data.name); // Solo retorna el nombre de la canción
          } else {
            resolve(null); // No se encontró la canción
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}
