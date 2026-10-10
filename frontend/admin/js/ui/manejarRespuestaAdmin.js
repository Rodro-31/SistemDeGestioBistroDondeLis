// Responsabilidad única: pintar el resultado (éxito/error) de una acción admin.
// Reutilizable entre "Publicar Menú", "Mesas" y cada fila de "Stock".
export function mostrarResultado(contenedor, datos) {
  const exito = datos && datos.success === true;
  const mensaje = (datos && datos.mensaje) || (exito ? 'Listo.' : 'Ocurrió un error.');
  contenedor.innerHTML = `<p class="${exito ? 'resultado-exito' : 'resultado-error'}">${mensaje}</p>`;
}

export function mostrarResultadoFila(elemento, datos) {
  const exito = datos && datos.success === true;
  elemento.textContent = exito ? '✓ Guardado' : (datos && datos.mensaje) || 'Error';
  elemento.className = `resultado-fila ${exito ? 'resultado-exito' : 'resultado-error'}`;
}
