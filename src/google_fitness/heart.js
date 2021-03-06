const axios = require("axios");
const url = require("url");

const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

/**
 * Clase para obtener datos de mi frecuencia cardiaca en tiempo real
 */
export default class Heart {
  constructor() {
    this.tokenExpires = 0; //¿Cuando expirará el token que tenemos? Sino para generar otro
    this.init();
  }

  async init() {
    //Generate refresh token
    await this.refreshToken();
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
        refresh_token: GOOGLE_REFRESH_TOKEN,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: "http://localhost",
        grant_type: "refresh_token",
      };

      axios({
        method: "POST",
        url: "https://oauth2.googleapis.com/token",
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
   * Función que buscará la última actualización de la frecuencia cardiaca sincronizada con Google Fitness
   * @returns Retornará la última actualización sincronizada
   */
  async getLastRate() {
    await this.refreshToken();

    const dataSource =
      "derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm";
    const startDate = Date.now() - 86400 * 1000 + "000000";
    const endDate = Date.now() + "000000";

    return new Promise((resolve, reject) => {
      axios({
        method: "GET",
        url:
          "https://www.googleapis.com/fitness/v1/users/me/dataSources/" +
          dataSource +
          "/datasets/" +
          endDate +
          "-" +
          startDate,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + this.access_token,
        },
      })
        .then(({ data }) => {
          if (data.point && data.point.length > 0) {
            const rate = data.point[data.point.length - 1];
            if (rate.value === undefined || rate.value.length === 0) {
              return reject("Rate not found");
            }

            const response = {
              value: rate.value[0].fpVal,
              time: rate.endTimeNanos,
            };
            resolve(response);
          } else {
            reject("Rate not found");
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}
