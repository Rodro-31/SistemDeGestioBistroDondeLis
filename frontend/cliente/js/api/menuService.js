// Responsabilidad única: hablar con GET /menu-hoy. Nada de UI, nada de carrito.
import { obtener } from './apiClient.js';

export async function obtenerMenuDelDia() {
  const { ok, datos } = await obtener('menu-hoy');
  if (!ok || !Array.isArray(datos)) {
    throw new Error('No se pudo cargar el menú del día. Intenta de nuevo en unos minutos.');
  }
  return datos;
}
