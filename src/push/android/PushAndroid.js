import fetch from "node-fetch";

/**
 * Clase para enviar push notifications a un celular usando FCM
 */
export default class PushAndroid {
  constructor(severToken, token) {
    this.severToken = severToken;
    this.token = token;
  }

  /**
   * Función que envía un mensaje PUSH
   * @param {string} title Título del mensaje
   * @param {string} body Cuerpo del mensaje
   * @returns Retorna la respuesta en formato JSON
   */
  async enviar(title, body) {
    const url = "https://fcm.googleapis.com/fcm/send";
    //Preparamos el mensaje
    const data = {
      to: this.token,
      notification: {
        title: title,
        body: body,
      },
    };

    //Hacemos la petición
    return await fetch(url, {
      method: "POST",
      headers: {
        Authorization: "key=" + this.severToken,
        "Content-Type": "application/json",
      },
      body: data && JSON.stringify(data),
    })
      .then((data) => data.json())
      .catch((err) => console.error(err));
  }
}
