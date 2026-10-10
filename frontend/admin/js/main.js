// Orquestador: conecta los módulos entre sí. Mínima lógica propia,
// igual que el main.js del sitio de cliente.
import { guardarClave, haySesion, cerrarSesion } from './api/authService.js';
import { obtenerMenuDelDia } from './api/menuService.js';
import { publicarMenu, actualizarMesas, actualizarStock } from './api/adminService.js';
import { validarMenu } from './dominio/validarMenu.js';
import { agregarFilaPlatillo, leerPlatillosForm, limpiarPlatillosForm } from './ui/renderFormularioMenu.js';
import { renderListaStock } from './ui/renderDisponibilidad.js';
import { mostrarResultado, mostrarResultadoFila } from './ui/manejarRespuestaAdmin.js';
import { obtenerPedidos, actualizarEstadoPedido } from './api/pedidosService.js';
import { renderListaPedidos } from './ui/renderPedidos.js';

const vistaLogin = document.getElementById('vista-login');
const vistaAdmin = document.getElementById('vista-admin');
const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');
const formLogin = document.getElementById('form-login');
const claveAdminInput = document.getElementById('clave-admin');
const loginError = document.getElementById('login-error');

const tabBtns = document.querySelectorAll('.tab-btn');
const panelPublicar = document.getElementById('panel-publicar-menu');
const panelDisponibilidad = document.getElementById('panel-disponibilidad');

const formPublicarMenu = document.getElementById('form-publicar-menu');
const listaPlatillosForm = document.getElementById('lista-platillos-form');
const btnAgregarPlatillo = document.getElementById('btn-agregar-platillo');
const resultadoPublicar = document.getElementById('resultado-publicar');

const toggleMesas = document.getElementById('toggle-mesas');
const resultadoMesas = document.getElementById('resultado-mesas');
const listaStock = document.getElementById('lista-stock');

const panelPedidos = document.getElementById('panel-pedidos');
const listaPedidos = document.getElementById('lista-pedidos');

function mostrarAdmin() {
  vistaLogin.classList.add('oculto');
  vistaAdmin.classList.remove('oculto');
  btnCerrarSesion.classList.remove('oculto');
}

function mostrarLogin() {
  vistaAdmin.classList.add('oculto');
  vistaLogin.classList.remove('oculto');
  btnCerrarSesion.classList.add('oculto');
  claveAdminInput.value = '';
}

formLogin.addEventListener('submit', (evento) => {
  evento.preventDefault();
  const clave = claveAdminInput.value.trim();
  if (!clave) return;
  guardarClave(clave);
  loginError.classList.add('oculto');
  mostrarAdmin();
});

btnCerrarSesion.addEventListener('click', () => {
  cerrarSesion();
  mostrarLogin();
});

tabBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    tabBtns.forEach((b) => b.classList.remove('activo'));
    btn.classList.add('activo');
    const vista = btn.dataset.vista;
    panelPublicar.classList.toggle('oculto', vista !== 'publicar-menu');
    panelDisponibilidad.classList.toggle('oculto', vista !== 'disponibilidad');
    panelPedidos.classList.toggle('oculto', vista !== 'pedidos');
    if (vista === 'disponibilidad') {
      cargarDisponibilidad();
    }
    if (vista === 'pedidos') {
      cargarPedidos();
    }
  });
});

btnAgregarPlatillo.addEventListener('click', () => agregarFilaPlatillo(listaPlatillosForm));
agregarFilaPlatillo(listaPlatillosForm); // arranca con una fila lista

formPublicarMenu.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const datos = {
    fecha_vigencia: document.getElementById('fecha-vigencia').value,
    hora_bloqueo: document.getElementById('hora-bloqueo').value,
    items: leerPlatillosForm(listaPlatillosForm),
  };

  const errores = validarMenu(datos);
  if (errores.length > 0) {
    alert(errores.join('\n'));
    return;
  }

  const botonEnviar = formPublicarMenu.querySelector('button[type="submit"]');
  botonEnviar.disabled = true;
  botonEnviar.textContent = 'Publicando…';

  const respuesta = await publicarMenu(datos);
  mostrarResultado(resultadoPublicar, respuesta);

  if (respuesta && respuesta.success) {
    formPublicarMenu.reset();
    limpiarPlatillosForm(listaPlatillosForm);
    agregarFilaPlatillo(listaPlatillosForm);
  }

  botonEnviar.disabled = false;
  botonEnviar.textContent = 'Publicar Menú';
});

toggleMesas.addEventListener('change', async () => {
  const respuesta = await actualizarMesas(toggleMesas.checked);
  mostrarResultado(resultadoMesas, respuesta);
});

async function cargarDisponibilidad() {
  listaStock.innerHTML = '<p class="aviso">Cargando…</p>';
  try {
    const platillos = await obtenerMenuDelDia();
    renderListaStock(listaStock, platillos, async (itemId, cantidad, elementoResultado) => {
      const respuesta = await actualizarStock(itemId, cantidad);
      mostrarResultadoFila(elementoResultado, respuesta);
    });
  } catch (error) {
    listaStock.innerHTML = `<p class="aviso">${error.message}</p>`;
  }
}

async function cargarPedidos() {
  listaPedidos.innerHTML = '<p class="aviso">Cargando…</p>';
  try {
    const pedidos = await obtenerPedidos();
    renderListaPedidos(listaPedidos, pedidos, async (codigo, nuevoEstado, elementoResultado) => {
      const respuesta = await actualizarEstadoPedido(codigo, nuevoEstado);
      if (respuesta && respuesta.success) {
        cargarPedidos();
      } else {
        mostrarResultadoFila(elementoResultado, respuesta);
      }
    });
  } catch (error) {
    listaPedidos.innerHTML = `<p class="aviso">${error.message}</p>`;
  }
}

// Arranque: si ya hay una clave guardada en esta pestaña, entra directo al panel.
if (haySesion()) {
  mostrarAdmin();
} else {
  mostrarLogin();
}
