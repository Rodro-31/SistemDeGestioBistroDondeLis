// Responsabilidad única: el estado del carrito. No toca el DOM, no sabe de fetch.
const items = new Map(); // item_almuerzo_id -> { item_almuerzo_id, nombre_platillo, precio, cantidad }

export function agregarItem(platillo) {
  const existente = items.get(platillo.item_almuerzo_id);
  if (existente) {
    existente.cantidad += 1;
    return;
  }
  items.set(platillo.item_almuerzo_id, {
    item_almuerzo_id: platillo.item_almuerzo_id,
    nombre_platillo: platillo.nombre_platillo,
    precio: parseFloat(platillo.precio),
    cantidad: 1,
  });
}

export function cambiarCantidad(itemAlmuerzoId, delta) {
  const item = items.get(itemAlmuerzoId);
  if (!item) return;
  item.cantidad += delta;
  if (item.cantidad <= 0) {
    items.delete(itemAlmuerzoId);
  }
}

export function obtenerItems() {
  return Array.from(items.values());
}

export function obtenerTotal() {
  return obtenerItems().reduce((suma, item) => suma + item.precio * item.cantidad, 0);
}

export function vaciar() {
  items.clear();
}

export function estaVacio() {
  return items.size === 0;
}
