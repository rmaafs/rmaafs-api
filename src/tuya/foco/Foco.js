import credentials from "../../../credentials.json";
import TuyaDevice from "../TuyaDevice";

const DEVICE_ID = credentials.tuya.foco.DEVICE_ID;
const CLIENT_ID = credentials.tuya.foco.CLIENT_ID;
const SECRET = credentials.tuya.foco.SECRET;

/**
 * Clase para controlar el foco
 */
export default class Foco extends TuyaDevice {
  constructor(readyCallback) {
    super(DEVICE_ID, CLIENT_ID, SECRET, readyCallback);
  }

  /**
   * Función para apagar o prender el foco según su estado actual.
   * @returns Respuesta en formato JSON
   */
  async switch() {
    const status = await this.getStatus();
    if (status.result) {
      const switchLed = status.result.find((it) => it.code === "switch_led");
      if (switchLed) {
        return await this.setSwitch(!switchLed.value);
      }
    }
  }

  /**
   * Función para prender o apagar el foco manualmente.
   * @param {Boolean} prendido
   * @returns Respuesta en formato JSON
   */
  async setSwitch(prendido) {
    const data = {
      commands: [{ code: "switch_led", value: prendido }],
    };
    return await this.comando(data);
  }

  /**
   * Función para poner el foco en cálido, esto porque al cambiarle el color, se ve diferente el color.
   * @returns Respuesta en formato JSON
   */
  async calido() {
    const data = {
      commands: [{ code: "work_mode", value: "white" }],
    };
    return await this.comando(data);
  }

  /**
   * Función para cambiar el color del foco en RGB
   * @param {number} r R
   * @param {number} g G
   * @param {number} b B
   */
  async setColor(r, g, b) {
    const color = this.RGBtoHSV(r, g, b);

    const data = {
      commands: [
        {
          code: "colour_data_v2",
          value: {
            h: color.h,
            s: color.s,
            v: color.v,
          },
        },
      ],
    };
    await this.comando(data);
  }
}
