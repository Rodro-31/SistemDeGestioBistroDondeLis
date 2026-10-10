// Responsabilidad única: guardar y leer la clave de admin en sessionStorage.
// No valida la clave contra el backend — eso lo descubre la primera petición real.
const CLAVE_KEY = 'dondelis_admin_api_key';

export function guardarClave(clave) {
  sessionStorage.setItem(CLAVE_KEY, clave);
}

export function obtenerClave() {
  return sessionStorage.getItem(CLAVE_KEY);
}

export function haySesion() {
  return !!obtenerClave();
}

export function cerrarSesion() {
  sessionStorage.removeItem(CLAVE_KEY);
}
