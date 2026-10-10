// Responsabilidad única: pintar el carrito y el total. La lógica de cantidades
// vive en dominio/carrito.js — este módulo solo refleja lo que le pasan.
import { obtenerTotal } from '../dominio/carrito.js';

export function renderCarrito(contenedor, items, alCambiarCantidad) {
  contenedor.innerHTML = '';

  for (const item of items) {
    const fila = document.createElement('div');
    fila.className = 'fila-carrito';
    fila.innerHTML = `
      <div>
        <p class="nombre">${item.nombre_platillo}</p>
        <p class="precio">Q${item.precio.toFixed(2)}</p>
      </div>
      <div class="stepper">
        <button type="button" class="btn-menos">−</button>
        <span>${item.cantidad}</span>
        <button type="button" class="btn-mas">+</button>
      </div>
    `;
    fila.querySelector('.btn-menos').addEventListener('click', () => alCambiarCantidad(item.item_almuerzo_id, -1));
    fila.querySelector('.btn-mas').addEventListener('click', () => alCambiarCantidad(item.item_almuerzo_id, 1));
    contenedor.appendChild(fila);
  }

  const totalEl = document.getElementById('total-pedido');
  if (totalEl) totalEl.textContent = `Q${obtenerTotal().toFixed(2)}`;
}
