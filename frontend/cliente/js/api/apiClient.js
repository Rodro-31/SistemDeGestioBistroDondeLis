// Único módulo que sabe hacer fetch() y conoce la URL base de n8n.
// Todo lo demás depende de esta abstracción (DIP) — si cambia el host,
// el puerto o se agrega HTTPS más adelante, solo se edita este archivo.

const BASE_URL = `http://${window.location.hostname}:5678/webhook`;

async function solicitar(path, opciones = {}) {
  let respuesta;
  try {
    respuesta = await fetch(`${BASE_URL}/${path}`, opciones);
  } catch (error) {
    throw new Error('No se pudo conectar con el servidor. Verifica tu conexión.');
  }

  let datos = null;
  try {
    datos = await respuesta.json();
  } catch (_) {
    datos = null;
  }

  return { ok: respuesta.ok, status: respuesta.status, datos };
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
