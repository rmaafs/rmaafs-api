const axios = require("axios");

export default class Heart {
  constructor() {
    this.baseUrl = process.env.HOME_ASSISTANT_URL;
    this.sensorId = process.env.HOME_ASSISTANT_SENSOR;
  }

  /**
   * Función que buscará la última actualización de la frecuencia cardiaca sincronizada con Home Assistant
   * @returns Retornará la última actualización sincronizada
   */
  async getLastRate() {
    const token = process.env.HOME_ASSISTANT_TOKEN;

    /* eslint-disable no-async-promise-executor */
    return new Promise(async (resolve, reject) => {
      const url = `${this.baseUrl}/api/states/${this.sensorId}`;

      try {
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.data.state === undefined) {
          return reject("Invalid heart value.");
        }

        const timeEpoch = new Date(
          response.data.last_changed.replace(/(\.\d{3})\d+/, "$1")
        ).getTime();

        return resolve({
          value: response.data.state,
          time: timeEpoch,
        });
      } catch (error) {
        console.error(
          `Error getting sensor value:`,
          error.response?.data || error.message
        );
        return reject(error);
      }
    });
  }
}
