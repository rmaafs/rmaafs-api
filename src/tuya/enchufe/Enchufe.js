import TuyaDevice from "../TuyaDevice";

const DEVICE_ID = process.env.TUYA_ENCHUFE_ID;
const CLIENT_ID = process.env.TUYA_CLIENT_ID;
const SECRET = process.env.TUYA_SECRET;

export default class Enchufe extends TuyaDevice {
  constructor(readyCallback) {
    super(DEVICE_ID, CLIENT_ID, SECRET, readyCallback);
  }

  /**
   * Función para apagar o prender el enchufe según su estado actual.
   * @returns Respuesta en formato JSON
   */
  async switch() {
    const status = await this.getStatus();
    if (status.result) {
      const switched = status.result.find((it) => it.code === "switch_1");
      if (switched) {
        return await this.setSwitch(!switched.value);
      }
    }
  }

  /**
   * Función para prender o apagar el enchufe manualmente.
   * @param {Boolean} prendido
   * @returns Respuesta en formato JSON
   */
  async setSwitch(prendido) {
    const data = {
      commands: [{ code: "switch_1", value: prendido }],
    };
    return await this.comando(data);
  }
}
