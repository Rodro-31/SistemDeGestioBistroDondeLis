// Responsabilidad única: pintar la lista de pedidos y sus acciones
// (copiar teléfono, avanzar de estado). alCambiarEstado recibe
// (codigo, nuevoEstado, elementoResultado) — no decide qué hacer con el backend.

const SIGUIENTE_ESTADO = {
  preparando: { valor: 'listo', etiqueta: 'Marcar como Listo' },
  listo: { valor: 'completado', etiqueta: 'Marcar como Completado' },
};

const ETIQUETA_ESTADO = {
  preparando: 'Preparando',
  listo: 'Listo',
  completado: 'Completado',
};

// navigator.clipboard solo funciona en contextos seguros (HTTPS o localhost).
// Accedemos por HTTP en la red local, así que si no está disponible o falla,
// usamos el método de respaldo con un textarea oculto + execCommand('copy').
async function copiarAlPortapapeles(texto) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(texto);
      return true;
    } catch {
      // sigue al respaldo
    }
  }

  const textarea = document.createElement('textarea');
  textarea.value = texto;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();

  let exito = false;
  try {
    exito = document.execCommand('copy');
  } catch {
    exito = false;
  }

  document.body.removeChild(textarea);
  return exito;
}

export function renderListaPedidos(contenedor, pedidos, alCambiarEstado) {
  contenedor.innerHTML = '';

  if (!pedidos || pedidos.length === 0) {
    contenedor.innerHTML = '<p class="aviso">No hay pedidos todavía.</p>';
    return;
  }

  for (const pedido of pedidos) {
    const fila = document.createElement('div');
    fila.className = 'fila-pedido';

    const siguiente = SIGUIENTE_ESTADO[pedido.estado];
    const etiquetaEstado = ETIQUETA_ESTADO[pedido.estado] || pedido.estado;

    fila.innerHTML = `
      <span class="codigo-pedido">${pedido.codigo}</span>
      <div class="info-pedido">
        <span class="nombre-pedido">${pedido.cliente_nombre || 'Sin nombre'}</span>
        <span class="telefono-pedido">${pedido.cliente_telefono}</span>
        <button type="button" class="btn-copiar-telefono">Copiar</button>
      </div>
      <span class="badge-estado badge-${pedido.estado}">${etiquetaEstado}</span>
      ${siguiente ? `<button type="button" class="btn-avanzar-estado">${siguiente.etiqueta}</button>` : '<span></span>'}
      <span class="resultado-fila"></span>
      <p class="resumen-pedido">${pedido.resumen || 'Sin detalle de items'}</p>
    `;

    const btnCopiar = fila.querySelector('.btn-copiar-telefono');
    btnCopiar.addEventListener('click', async () => {
      const exito = await copiarAlPortapapeles(pedido.cliente_telefono);
      btnCopiar.textContent = exito ? '✓ Copiado' : 'Error';
      setTimeout(() => { btnCopiar.textContent = 'Copiar'; }, 1500);
    });

    const btnAvanzar = fila.querySelector('.btn-avanzar-estado');
    if (btnAvanzar && siguiente) {
      const resultadoFila = fila.querySelector('.resultado-fila');
      btnAvanzar.addEventListener('click', () => {
        alCambiarEstado(pedido.codigo, siguiente.valor, resultadoFila);
      });
    }

    contenedor.appendChild(fila);
  }
}