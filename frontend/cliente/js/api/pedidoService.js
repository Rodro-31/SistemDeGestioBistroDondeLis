// Responsabilidad única: hablar con POST /crear-pedido.
import { enviarJSON } from './apiClient.js';

export async function crearPedido(datosPedido) {
  const { datos } = await enviarJSON('crear-pedido', datosPedido);
  // El backend siempre responde JSON (éxito, error de validación o notificación fallida),
  // así que devolvemos "datos" tal cual y dejamos que manejarRespuesta.js decida qué pantalla mostrar.
  return datos ?? { success: false, mensaje: 'No se pudo conectar con el servidor.' };
}
