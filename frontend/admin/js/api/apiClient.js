// Único punto que llama fetch() (DIP) — igual que en el sitio de cliente,
// pero agrega el header x-api-key en cada petición cuando hay sesión activa.
import { obtenerClave } from './authService.js';

const BASE_URL = `http://${window.location.hostname}:5678/webhook`;

async function solicitar(path, opciones = {}) {
  const headers = { ...(opciones.headers || {}) };
  const clave = obtenerClave();
  if (clave) {
    headers['x-api-key'] = clave;
  }

  const respuesta = await fetch(`${BASE_URL}/${path}`, { ...opciones, headers });
  return respuesta.json();
}

export function obtener(path) {
  return solicitar(path, { method: 'GET' });
}

export function enviarJSON(path, body) {
  return solicitar(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
