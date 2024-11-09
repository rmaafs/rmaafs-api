import admin from "firebase-admin";

// https://firebase.google.com/docs/cloud-messaging/auth-server#provide-credentials-manually
// Define la ruta de service-account-file en la variable de entorno GOOGLE_APPLICATION_CREDENTIALS

/**
 * Clase para enviar push notifications a un celular usando FCM
 */
export default class PushAndroid {
  constructor(token) {
    this.token = token || process.env.PUSH_TOKEN;

    // Inicializamos firebase admin
    admin.initializeApp({
      credential: admin.credential.cert(
        process.env.GOOGLE_APPLICATION_CREDENTIALS
      ),
    });
  }

  /**
   * Función que envía un mensaje PUSH
   * @param {string} title Título del mensaje
   * @param {string} body Cuerpo del mensaje
   * @returns Retorna la respuesta en formato JSON
   */
  async enviar(title, body) {
    //Preparamos el mensaje
    const data = {
      token: this.token,
      notification: {
        title: title,
        body: body,
      },
    };

    try {
      await admin.messaging().send(data);
      return { message: "ok" };
    } catch (error) {
      return { error: JSON.stringify(error) };
    }
  }
}
