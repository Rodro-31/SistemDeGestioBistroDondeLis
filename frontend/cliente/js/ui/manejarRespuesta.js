// Decide qué pantalla de resultado mostrar según la respuesta del backend.
// OCP: agregar un caso nuevo es sumar una entrada al mapa "estrategias",
// nunca tocar los casos que ya están probados.

function clasificarRespuesta(datos) {
  if (datos.success === true) return 'exito';
  if (datos.codigo) return 'notificacionFallida'; // el pedido sí se guardó, solo falló el correo
  if (typeof datos.mensaje === 'string' && datos.mensaje.toLowerCase().includes('mesa')) return 'mesasDeshabilitadas';
  return 'error'; // validación / disponibilidad / carrito vacío
}

const estrategias = {
  exito: (contenedor, datos) => {
    const mensajeConNumeroResaltado = datos.mensaje.replace(/(\d{7,})/, '<strong>$1</strong>');
    contenedor.innerHTML = `
      <div class="icono-check">✓</div>
      <h2>¡Pedido recibido!</h2>
      <p>${mensajeConNumeroResaltado}</p>
      <div class="resumen">
        <p><strong>Código de pedido:</strong> ${datos.codigo}</p>
        <p><strong>Total a pagar:</strong> Q${parseFloat(datos.total).toFixed(2)}</p>
      </div>
      <button type="button" class="btn-volver">Volver al menú</button>
    `;
  },
  notificacionFallida: (contenedor, datos) => {
    contenedor.innerHTML = `
      <div class="icono-aviso">!</div>
      <h2>Pedido registrado</h2>
      <p>${datos.mensaje}</p>
      <button type="button" class="btn-volver">Volver al menú</button>
    `;
  },
  mesasDeshabilitadas: (contenedor, datos) => {
    contenedor.innerHTML = `
      <div class="icono-aviso">!</div>
      <h2>No pudimos procesar tu pedido</h2>
      <p>${datos.mensaje}</p>
      <button type="button" class="btn-cambiar-entrega">Elegir domicilio o recoger</button>
      <button type="button" class="btn-volver">Volver al menú</button>
    `;
  },
  error: (contenedor, datos) => {
    contenedor.innerHTML = `
      <div class="icono-aviso">!</div>
      <h2>No pudimos procesar tu pedido</h2>
      <p>${datos.mensaje}</p>
      <button type="button" class="btn-intentar">Intentar de nuevo</button>
      <button type="button" class="btn-volver">Volver al menú</button>
    `;
  },
};

export function renderResultado(contenedor, datos, manejadores = {}) {
  const tipo = clasificarRespuesta(datos);
  estrategias[tipo](contenedor, datos);

  contenedor.querySelector('.btn-volver')?.addEventListener('click', manejadores.alVolver);
  contenedor.querySelector('.btn-intentar')?.addEventListener('click', manejadores.alIntentar);
  contenedor.querySelector('.btn-cambiar-entrega')?.addEventListener('click', manejadores.alCambiarEntrega);
}
