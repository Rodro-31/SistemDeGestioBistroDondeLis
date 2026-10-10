// Responsabilidad única: validar el formulario de "Publicar Menú" antes de enviarlo.
// No toca el DOM ni el backend — solo reglas de negocio.
export function validarMenu({ fecha_vigencia, hora_bloqueo, items }) {
  const errores = [];

  if (!fecha_vigencia) {
    errores.push('Selecciona la fecha de vigencia del menú.');
  }
  if (!hora_bloqueo) {
    errores.push('Selecciona la hora de bloqueo.');
  }
  if (!items || items.length === 0) {
    errores.push('Agrega al menos un platillo.');
  } else {
    items.forEach((item, i) => {
      if (!item.nombre || item.nombre.trim().length === 0) {
        errores.push(`El platillo #${i + 1} necesita un nombre.`);
      }
      if (!item.precio || item.precio <= 0 || Number.isNaN(item.precio)) {
        errores.push(`El platillo #${i + 1} necesita un precio válido.`);
      }
      if (item.cantidad_disponible === undefined || item.cantidad_disponible < 0 || Number.isNaN(item.cantidad_disponible)) {
        errores.push(`El platillo #${i + 1} necesita una cantidad disponible válida.`);
      }
    });
  }

  return errores;
}
