# Curls de prueba formal — Sistema de Pedidos Web "Donde Lis" (7 workflows)

Todos apuntan a `http://192.168.245.5:5678` salvo que se indique lo contrario. Copia y pega tal cual en la terminal del servidor (o desde tu máquina si el puerto 5678 es alcanzable).

La clave de los endpoints protegidos (`x-api-key`) es **`test123`** (confirmada el 10 oct 2026).

⚠️ **Antes de correr todo esto, obtén un `item_almuerzo_id` vigente de HOY** (lo vamos a necesitar para los casos de éxito de Workflow 2 y Workflow 5):

```bash
docker exec -it proyectofinal-dondelis-postgres-1 psql -U admin-rodro -d dondelis -c \
  "SELECT ia.item_almuerzo_id, p.nombre, ia.cantidad_disponible, m.fecha_vigencia, m.hora_bloqueo
   FROM items_almuerzo ia
   JOIN menus m ON m.menu_id = ia.menu_id
   JOIN platillos p ON p.platillo_id = ia.platillo_id
   WHERE (m.fecha_vigencia + m.hora_bloqueo) > (now() AT TIME ZONE 'America/Guatemala')
   ORDER BY ia.item_almuerzo_id;"
```

Reemplaza `<ITEM_ID>` en los curls de abajo por uno de los que te devuelva esa consulta.

---

## Workflow 1 — Publicar Menú

`POST /publicar-menu` — protegido con Header Auth. Valida que `fecha_vigencia` sea hoy o futura.

### ✅ Caso normal (fecha futura, válida)
```bash
curl -X POST http://192.168.245.5:5678/webhook/publicar-menu \
  -H "Content-Type: application/json" \
  -H "x-api-key: test123" \
  -d '{
    "fecha_vigencia": "2026-12-31",
    "hora_bloqueo": "14:00:00",
    "items": [
      { "nombre": "Caldo de res", "precio": 30, "cantidad_disponible": 10 }
    ]
  }'
```
Esperado: `{"success":true,"mensaje":"Menú publicado correctamente"}`.

### ❌ Caso con error controlado (fecha ya vencida)
```bash
curl -X POST http://192.168.245.5:5678/webhook/publicar-menu \
  -H "Content-Type: application/json" \
  -H "x-api-key: test123" \
  -d '{
    "fecha_vigencia": "2026-01-01",
    "hora_bloqueo": "11:00:00",
    "items": [
      { "nombre": "Caldo de res", "precio": 30, "cantidad_disponible": 10 }
    ]
  }'
```
Esperado: `{"success":false,"mensaje":"No se puede publicar un menú con fecha vencida"}` — rama `Validar Fecha → false → Registrar Error → Responder Error`.

---

## Workflow 2 — Crear Pedido

`POST /crear-pedido` — público, sin autenticación (a propósito, es el endpoint del cliente final). Reemplaza `<ITEM_ID>` por el que obtuviste arriba.

### ✅ Caso normal (pedido válido, recoger)
```bash
curl -X POST http://192.168.245.5:5678/webhook/crear-pedido \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_nombre": "Rodrigo Caal",
    "cliente_telefono": "50212345678",
    "cliente_email": "rodro934@gmail.com",
    "tipo_entrega": "recoger",
    "items": [
      { "item_almuerzo_id": <ITEM_ID>, "cantidad": 1, "origen": "almuerzo" }
    ]
  }'
```
Esperado: `{"success":true,"codigo":"PED-XXXXXX", ...}` + correo de confirmación real recibido en `rodro934@gmail.com`.

### ❌ Caso con error — pedido vacío
```bash
curl -X POST http://192.168.245.5:5678/webhook/crear-pedido \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_nombre": "Rodrigo Caal",
    "cliente_telefono": "50212345678",
    "cliente_email": "rodro934@gmail.com",
    "tipo_entrega": "recoger",
    "items": []
  }'
```
Esperado: `{"success":false,"mensaje":"Pedido inválido: no se especificaron items en el carrito"}`.

### ❌ Caso con error — item inexistente o fuera de vigencia
```bash
curl -X POST http://192.168.245.5:5678/webhook/crear-pedido \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_nombre": "Rodrigo Caal",
    "cliente_telefono": "50212345678",
    "cliente_email": "rodro934@gmail.com",
    "tipo_entrega": "recoger",
    "items": [
      { "item_almuerzo_id": 999999, "cantidad": 1, "origen": "almuerzo" }
    ]
  }'
```
Esperado: `{"success":false,"mensaje":"Pedido inválido: menú fuera de vigencia o cantidad no disponible"}`.

### ❌ Caso con error — mesa deshabilitada
Primero deshabilita mesas con el curl de Workflow 5 (`admin/mesas` con `"habilitado": false`), luego:
```bash
curl -X POST http://192.168.245.5:5678/webhook/crear-pedido \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_nombre": "Rodrigo Caal",
    "cliente_telefono": "50212345678",
    "cliente_email": "rodro934@gmail.com",
    "tipo_entrega": "mesa",
    "items": [
      { "item_almuerzo_id": <ITEM_ID>, "cantidad": 1, "origen": "almuerzo" }
    ]
  }'
```
Esperado: `{"success":false,"mensaje":"Por el momento no estamos recibiendo pedidos para comer en mesa. Puedes elegir domicilio o recoger."}`. No olvides volver a habilitar mesas después con `"habilitado": true`.

---

## Workflow 3 — Notificar Pedido

`POST /notificar-pedido` — protegido con Header Auth. Normalmente la llama Workflow 2 internamente, pero se puede probar directo.

### ✅ Caso normal (correo válido)
```bash
curl -X POST http://192.168.245.5:5678/webhook/notificar-pedido \
  -H "Content-Type: application/json" \
  -H "x-api-key: test123" \
  -d '{
    "cliente_email": "rodro934@gmail.com",
    "cliente_nombre": "Rodrigo Caal",
    "codigo": "PED-TEST01",
    "resumen": "Caldo de res x1",
    "total": 30,
    "tipo_entrega": "recoger"
  }'
```
Esperado: `{"success":true,"mensaje":"Notificación enviada"}` + correo real recibido.

### ❌ Caso con error — correo inválido
```bash
curl -X POST http://192.168.245.5:5678/webhook/notificar-pedido \
  -H "Content-Type: application/json" \
  -H "x-api-key: test123" \
  -d '{
    "cliente_email": "esto-no-es-un-correo",
    "cliente_nombre": "Rodrigo Caal",
    "codigo": "PED-TEST02",
    "resumen": "Caldo de res x1",
    "total": 30,
    "tipo_entrega": "recoger"
  }'
```
Esperado: `{"success":false,"mensaje":"No se pudo enviar la notificación, pero el pedido fue registrado correctamente"}` — rama `Validar Envío → false → Registrar Error Notificación → Responder Error Notificación`.

---

## Workflow 4 — Manejo de Errores Global

Este workflow **no tiene webhook propio** — es un `Error Trigger` que n8n dispara automáticamente cuando CUALQUIER otro workflow falla con un error no controlado (está configurado como `errorWorkflow` en los 6 workflows restantes). No se prueba con curl directo; se prueba provocando un error real en otro workflow y confirmando que quedó registrado:

```bash
# 1. Provoca un error real, por ejemplo apagando Postgres un momento y
#    corriendo cualquier curl de arriba (va a fallar al no poder conectar a la BD).
#    O simplemente usa uno de los curls con datos que rompan un nodo (ej. un
#    JSON mal formado puede generar un error de parseo distinto al validado).

# 2. Confirma que quedó en la tabla errores con el mensaje de "Error no controlado...":
docker exec -it proyectofinal-dondelis-postgres-1 psql -U admin-rodro -d dondelis -c \
  "SELECT * FROM errores ORDER BY error_id DESC LIMIT 5;"
```
Esperado: una fila reciente con `mensaje` empezando con `"Error no controlado en nodo..."`.

---

## Workflow 5 — Administrar Disponibilidad

Dos webhooks, ambos protegidos con Header Auth.

### 5a. `POST /admin/mesas`

#### ✅ Caso normal
```bash
curl -X POST http://192.168.245.5:5678/webhook/admin/mesas \
  -H "Content-Type: application/json" \
  -H "x-api-key: test123" \
  -d '{ "habilitado": true }'
```
Esperado: `{"success":true,"mensaje":"Configuración de mesas actualizada"}`.

#### ❌ Caso con error — campo inválido
```bash
curl -X POST http://192.168.245.5:5678/webhook/admin/mesas \
  -H "Content-Type: application/json" \
  -H "x-api-key: test123" \
  -d '{ "habilitado": "si" }'
```
Esperado: `{"success":false,"mensaje":"El campo habilitado debe ser true o false"}` (HTTP 400) — `"si"` es string, no boolean.

### 5b. `POST /admin/stock`

#### ✅ Caso normal
```bash
curl -X POST http://192.168.245.5:5678/webhook/admin/stock \
  -H "Content-Type: application/json" \
  -H "x-api-key: test123" \
  -d '{ "item_almuerzo_id": <ITEM_ID>, "cantidad_disponible": 5 }'
```
Esperado: `{"success":true,"mensaje":"Stock actualizado"}`.

#### ❌ Caso con error — item inexistente
```bash
curl -X POST http://192.168.245.5:5678/webhook/admin/stock \
  -H "Content-Type: application/json" \
  -H "x-api-key: test123" \
  -d '{ "item_almuerzo_id": 999999, "cantidad_disponible": 5 }'
```
Esperado: `{"success":false,"mensaje":"El item de almuerzo no existe"}` (HTTP 404).

#### ❌ Caso con error — validación (cantidad negativa)
```bash
curl -X POST http://192.168.245.5:5678/webhook/admin/stock \
  -H "Content-Type: application/json" \
  -H "x-api-key: test123" \
  -d '{ "item_almuerzo_id": <ITEM_ID>, "cantidad_disponible": -1 }'
```
Esperado: `{"success":false,"mensaje":"Debes enviar item_almuerzo_id y cantidad_disponible válidos"}` (HTTP 400).

---

## Workflow 6 — Consultar Menú del Día

`GET /menu-hoy` — público, sin autenticación.

### ✅ Caso normal
```bash
curl -i http://192.168.245.5:5678/webhook/menu-hoy
```
Esperado: `200 OK` con un arreglo JSON de los platillos vigentes (los que todavía no llegan a su `fecha_vigencia + hora_bloqueo`).

### Caso "sin menú vigente" (no es un error del sistema, es un estado válido)
Si no hay ningún menú publicado con vigencia futura, el mismo curl de arriba debe devolver un arreglo vacío `[]` (no un error). Es el comportamiento esperado cuando todavía no se ha publicado el menú del día.

---

## Workflow 7 — Administrar Pedidos

### 7a. `GET /pedidos` — protegido con Header Auth

```bash
curl -s http://192.168.245.5:5678/webhook/pedidos \
  -H "x-api-key: test123" | python3 -m json.tool
```
Esperado: arreglo JSON de todos los pedidos, con el campo `resumen` por pedido.

### 7b. `POST /admin/pedidos/estado`

#### ✅ Caso normal (usa un código de pedido real que exista, ej. el que generó el curl de Workflow 2)
```bash
curl -X POST http://192.168.245.5:5678/webhook/admin/pedidos/estado \
  -H "Content-Type: application/json" \
  -H "x-api-key: test123" \
  -d '{ "codigo": "PED-XXXXXX", "nuevo_estado": "listo" }'
```
Esperado: `{"success":true, ...}`.

#### ❌ Caso con error — estado inválido
```bash
curl -X POST http://192.168.245.5:5678/webhook/admin/pedidos/estado \
  -H "Content-Type: application/json" \
  -H "x-api-key: test123" \
  -d '{ "codigo": "PED-XXXXXX", "nuevo_estado": "cancelado" }'
```
Esperado: `{"success":false, ...}` (HTTP 400) — `"cancelado"` no está en `{preparando, listo, completado}`.

---

## Si te piden ver la bitácora o los errores en vivo

```bash
docker exec -it proyectofinal-dondelis-postgres-1 psql -U admin-rodro -d dondelis -c \
  "SELECT * FROM bitacora ORDER BY bitacora_id DESC LIMIT 10;"

docker exec -it proyectofinal-dondelis-postgres-1 psql -U admin-rodro -d dondelis -c \
  "SELECT * FROM errores ORDER BY error_id DESC LIMIT 10;"
```
