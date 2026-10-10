// Responsabilidad única: pintar la lista de platillos. No valida, no llama al backend.
export function renderMenu(contenedor, platillos, alAgregar) {
  contenedor.innerHTML = '';

  if (platillos.length === 0) {
    contenedor.innerHTML = '<p class="aviso">No hay menú publicado por el momento.</p>';
    return;
  }

  for (const platillo of platillos) {
    const card = document.createElement('div');
    card.className = 'card-platillo';
    card.innerHTML = `
      <div class="info-platillo">
        <h3>${platillo.nombre_platillo}</h3>
        <p class="precio">Q${parseFloat(platillo.precio).toFixed(2)}</p>
      </div>
      <button class="btn-agregar" type="button">Agregar</button>
    `;
    card.querySelector('.btn-agregar').addEventListener('click', () => alAgregar(platillo));
    contenedor.appendChild(card);
  }
}
