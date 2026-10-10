// Responsabilidad única: pintar la lista de stock del menú de hoy.
// alGuardarStock recibe (item_almuerzo_id, cantidad, elementoResultado) — no decide qué hacer con el backend.
export function renderListaStock(contenedor, platillos, alGuardarStock) {
  contenedor.innerHTML = '';

  if (!platillos || platillos.length === 0) {
    contenedor.innerHTML = '<p class="aviso">No hay menú publicado hoy.</p>';
    return;
  }

  for (const platillo of platillos) {
    const fila = document.createElement('div');
    fila.className = 'fila-stock';
    fila.innerHTML = `
      <span class="nombre-stock">${platillo.nombre_platillo}</span>
      <input type="number" class="input-stock" min="0" value="${platillo.cantidad_disponible}">
      <button type="button" class="btn-guardar-stock">Guardar</button>
      <span class="resultado-fila"></span>
    `;
    const input = fila.querySelector('.input-stock');
    const boton = fila.querySelector('.btn-guardar-stock');
    const resultadoFila = fila.querySelector('.resultado-fila');
    boton.addEventListener('click', () => {
      const cantidad = parseInt(input.value, 10);
      alGuardarStock(platillo.item_almuerzo_id, cantidad, resultadoFila);
    });
    contenedor.appendChild(fila);
  }
}
