import { obtener } from './apiClient.js';

export function obtenerMenuDelDia() {
  return obtener('menu-hoy');
}
