import { enviarJSON } from './apiClient.js';

export function publicarMenu(datos) {
  return enviarJSON('publicar-menu', datos);
}

export function actualizarMesas(habilitado) {
  return enviarJSON('admin/mesas', { habilitado });
}

export function actualizarStock(item_almuerzo_id, cantidad_disponible) {
  return enviarJSON('admin/stock', { item_almuerzo_id, cantidad_disponible });
}
