import fetch from "node-fetch";
import crypto from "crypto";

const BASE_URL = "https://openapi.tuyaus.com/v1.0";

/**
 * Clase que hace las peticiones a TuyaSmart
 */
export default class TuyaDevice {
  constructor(DEVICE_ID, CLIENT_ID, SECRET, readyCallback) {
    this.DEVICE_ID = DEVICE_ID;
    this.CLIENT_ID = CLIENT_ID;
    this.SECRET = SECRET;

    this.generateToken(readyCallback);
    this.easy_sign = "";
    this.access_token = "";
    this.tokenExpires = 0;
  }

  /**
   * Función para cambiar algún parámetro del foco.
   * @param {Object} data Datos a enviar al servidor de Tuya
   * @returns Retorna el JSON respuesta
   */
  async comando(data) {
    const url = BASE_URL + "/devices/" + this.DEVICE_ID + "/commands";
    return this.sendRequest(url, "POST", data);
  }

  /**
   * Función que solicita el estatus actual del foco
   * @returns Retorna el JSON respuesta
   */
  async getStatus() {
    const url = BASE_URL + "/devices/" + this.DEVICE_ID + "/status";
    return this.sendRequest(url, "GET");
  }

  /**
   * Función que hace la petición HTTP
   * @param {string} url URL a hacer la petición
   * @param {string} method Método de la petición
   * @param {Object} data Objeto que mandaremos
   * @returns Retornará la respuesta en formato JSON
   */
  async sendRequest(url, method, data) {
    //Primero verificamos que el token que generamos previamente sea vigente, sino generamos otro
    if (Date.now() > this.tokenExpires) {
      await this.generateToken(() => {});
    }

    let timestamp = Date.now();
    this.generateSign(true, timestamp);

    return await fetch(url, {
      method: method,
      headers: {
        client_id: this.CLIENT_ID,
        access_token: this.access_token,
        sign: this.easy_sign,
        t: timestamp,
        sign_method: "HMAC-SHA256",
        "Content-Type": "application/json",
      },
      body: data && JSON.stringify(data),
    }).then((data) => data.json());
  }

  /**
   * Función que genera un token para poder hacer las peticiones a Tuya.
   * @param {Function} readyCallback Función callback al finalizar
   */
  async generateToken(readyCallback) {
    let timestamp = Date.now();
    this.generateSign(false, timestamp);

    const url = BASE_URL + "/token?grant_type=1";
    await fetch(url, {
      headers: {
        client_id: this.CLIENT_ID,
        sign: this.easy_sign,
        t: timestamp,
        sign_method: "HMAC-SHA256",
      },
    })
      .then((data) => data.json())
      .then((json) => {
        if (json.result.access_token) {
          this.access_token = json.result.access_token;
          this.tokenExpires =
            (Number(json.result.expire_time) - 10) * 1000 + Date.now();
        }
        readyCallback();
      })
      .catch((err) => {
        console.log("ERROR:", err);
      });
  }

  /**
   * Función que genera un SIGN para la petición
   * @param {Boolean} business ¿El sign es modo bussiness?
   * @param {Timestamp} timestamp Timestamp de la petición
   */
  generateSign(business, timestamp) {
    const message =
      this.CLIENT_ID + (business ? this.access_token : "") + timestamp;
    const secret = this.SECRET;
    var hash = crypto
      .createHmac("sha256", secret)
      .update(message)
      .digest("hex")
      .toUpperCase();

    this.easy_sign = hash;
  }

  /**
   * Función que cambia un color RGB a HSV.
   * @param {number} r R
   * @param {number} g G
   * @param {number} b B
   * @returns Retorna el color en formato HSV en un objeto.
   */
  RGBtoHSV(r, g, b) {
    (r /= 255), (g /= 255), (b /= 255);

    var max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    var h,
      s,
      v = max;

    var d = max - min;
    s = max == 0 ? 0 : d / max;
    if (max == min) {
      h = 0; // achromatic
    } else {
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }

      h /= 6;
    }

    function mapMinMax(value, oldMin, oldMax, newMin, newMax) {
      return (
        ((newMax - newMin) * (value - oldMin)) / (oldMax - oldMin) + newMin
      );
    }

    h = mapMinMax(h, 0, 1, 0, 360);
    return { h: h | 0, s: (s * 1000) | 0, v: (v * 1000) | 0 };
  }
}
