// Responsabilidad única: validar los datos del cliente antes de enviarlos.
// No toca el DOM ni el backend — solo reglas de negocio.
export function validarDatosCliente({ cliente_nombre, cliente_telefono, cliente_email, tipo_entrega }) {
  const errores = [];

  if (!cliente_nombre || cliente_nombre.trim().length < 3) {
    errores.push('Ingresa tu nombre completo.');
  }
  if (!cliente_telefono || cliente_telefono.trim().length < 8) {
    errores.push('Ingresa un teléfono válido.');
  }
  if (!cliente_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cliente_email)) {
    errores.push('Ingresa un correo electrónico válido.');
  }
  if (!['domicilio', 'recoger', 'mesa'].includes(tipo_entrega)) {
    errores.push('Elige un tipo de entrega.');
  }

  return errores;
}
