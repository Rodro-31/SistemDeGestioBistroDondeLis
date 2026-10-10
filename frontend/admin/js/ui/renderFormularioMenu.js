// Responsabilidad única: pintar y leer las filas dinámicas de platillos
// del formulario "Publicar Menú". No llama al backend.
let contadorFilas = 0;

export function agregarFilaPlatillo(contenedor) {
  const id = `platillo-${contadorFilas++}`;
  const fila = document.createElement('div');
  fila.className = 'fila-platillo-form';
  fila.dataset.filaId = id;
  fila.innerHTML = `
    <input type="text" placeholder="Nombre del platillo" class="input-nombre" required>
    <input type="number" placeholder="Precio" class="input-precio" min="0" step="0.01" required>
    <input type="number" placeholder="Cantidad" class="input-cantidad" min="0" required>
    <button type="button" class="btn-quitar-platillo" title="Quitar platillo">×</button>
  `;
  fila.querySelector('.btn-quitar-platillo').addEventListener('click', () => fila.remove());
  contenedor.appendChild(fila);
}

export function leerPlatillosForm(contenedor) {
  const filas = contenedor.querySelectorAll('.fila-platillo-form');
  return Array.from(filas).map((fila) => ({
    nombre: fila.querySelector('.input-nombre').value.trim(),
    precio: parseFloat(fila.querySelector('.input-precio').value),
    cantidad_disponible: parseInt(fila.querySelector('.input-cantidad').value, 10),
  }));
}

export function limpiarPlatillosForm(contenedor) {
  contenedor.innerHTML = '';
}
