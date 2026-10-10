// Orquestador: conecta los módulos entre sí. Tiene la mínima lógica propia
// posible — cada decisión real (validar, pintar, clasificar respuesta) vive
// en su módulo correspondiente.
import { obtenerMenuDelDia } from './api/menuService.js';
import { crearPedido } from './api/pedidoService.js';
import { agregarItem, cambiarCantidad, obtenerItems, obtenerTotal, vaciar, estaVacio } from './dominio/carrito.js';
import { validarDatosCliente } from './dominio/validarPedido.js';
import { renderMenu } from './ui/renderMenu.js';
import { renderCarrito } from './ui/renderCarrito.js';
import { renderResultado } from './ui/manejarRespuesta.js';

const vistaMenu = document.getElementById('vista-menu');
const vistaPedido = document.getElementById('vista-pedido');
const vistaResultado = document.getElementById('vista-resultado');

const contenedorPlatillos = document.getElementById('lista-platillos');
const contenedorCarrito = document.getElementById('lista-carrito');
const contenedorResultado = document.getElementById('contenido-resultado');

const formPedido = document.getElementById('form-pedido');
const barraVerPedido = document.getElementById('barra-ver-pedido');
const btnVolverMenuPedido = document.getElementById('btn-volver-menu-pedido');
const tituloEncabezado = document.getElementById('titulo-encabezado');
const subtituloEncabezado = document.getElementById('subtitulo-encabezado');

// Único encabezado compartido por las 3 vistas: esta tabla dice qué debe
// mostrar en cada una, en vez de tener un <header> repetido por vista.
const CONFIG_ENCABEZADO = {
  'vista-menu': { titulo: 'Bistro Donde Lis', subtitulo: 'Menú de hoy · Almuerzo', mostrarVolver: false },
  'vista-pedido': { titulo: 'Tu Pedido', subtitulo: null, mostrarVolver: true },
  'vista-resultado': { titulo: 'Bistro Donde Lis', subtitulo: null, mostrarVolver: false },
};

function mostrarVista(vista) {
  [vistaMenu, vistaPedido, vistaResultado].forEach((v) => v.classList.add('oculto'));
  vista.classList.remove('oculto');

  const config = CONFIG_ENCABEZADO[vista.id];
  tituloEncabezado.textContent = config.titulo;
  subtituloEncabezado.classList.toggle('oculto', !config.subtitulo);
  if (config.subtitulo) subtituloEncabezado.textContent = config.subtitulo;
  btnVolverMenuPedido.classList.toggle('oculto', !config.mostrarVolver);
}

function actualizarBarraInferior() {
  if (estaVacio()) {
    barraVerPedido.classList.add('oculto');
    return;
  }
  barraVerPedido.classList.remove('oculto');
  barraVerPedido.textContent = `Ver pedido (${obtenerItems().length}) · Q${obtenerTotal().toFixed(2)}`;
}

async function cargarMenu() {
  contenedorPlatillos.innerHTML = '<p class="aviso">Cargando menú…</p>';
  try {
    const platillos = await obtenerMenuDelDia();
    renderMenu(contenedorPlatillos, platillos, (platillo) => {
      agregarItem(platillo);
      actualizarBarraInferior();
    });
  } catch (error) {
    contenedorPlatillos.innerHTML = `<p class="aviso">${error.message}</p>`;
  }
}

function refrescarCarrito() {
  renderCarrito(contenedorCarrito, obtenerItems(), (itemId, delta) => {
    cambiarCantidad(itemId, delta);
    refrescarCarrito();
    actualizarBarraInferior();
  });
}

function irAPedido() {
  refrescarCarrito();
  mostrarVista(vistaPedido);
}

function volverAlMenu() {
  mostrarVista(vistaMenu);
}

async function manejarEnvioPedido(evento) {
  evento.preventDefault();

  const datosCliente = {
    cliente_nombre: formPedido.cliente_nombre.value.trim(),
    cliente_telefono: formPedido.cliente_telefono.value.trim(),
    cliente_email: formPedido.cliente_email.value.trim(),
    tipo_entrega: formPedido.tipo_entrega.value,
  };

  const errores = validarDatosCliente(datosCliente);
  if (errores.length > 0) {
    alert(errores.join('\n'));
    return;
  }
  if (estaVacio()) {
    alert('Agrega al menos un platillo antes de confirmar.');
    return;
  }

  const payload = {
    ...datosCliente,
    items: obtenerItems().map((item) => ({
      item_almuerzo_id: item.item_almuerzo_id,
      cantidad: item.cantidad,
      origen: 'almuerzo',
    })),
  };

  const botonEnviar = formPedido.querySelector('button[type="submit"]');
  botonEnviar.disabled = true;
  botonEnviar.textContent = 'Enviando…';

  const datos = await crearPedido(payload);

  renderResultado(contenedorResultado, datos, {
    alVolver: () => {
      vaciar();
      actualizarBarraInferior();
      formPedido.reset();
      cargarMenu();
      mostrarVista(vistaMenu);
    },
    alIntentar: () => mostrarVista(vistaPedido),
    alCambiarEntrega: () => mostrarVista(vistaPedido),
  });
  mostrarVista(vistaResultado);

  botonEnviar.disabled = false;
  botonEnviar.textContent = 'Confirmar Pedido';
}

barraVerPedido.addEventListener('click', irAPedido);
btnVolverMenuPedido.addEventListener('click', volverAlMenu);
formPedido.addEventListener('submit', manejarEnvioPedido);

cargarMenu();
