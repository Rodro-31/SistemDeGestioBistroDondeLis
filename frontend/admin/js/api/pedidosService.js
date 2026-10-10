import { obtener, enviarJSON } from './apiClient.js';

export function obtenerPedidos() {
  return obtener('pedidos');
}

export function actualizarEstadoPedido(codigo, nuevo_estado) {
  return enviarJSON('admin/pedidos/estado', { codigo, nuevo_estado });
}