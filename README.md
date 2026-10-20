# Donde Lis — Sistema de Pedidos Web

Proyecto Final de **Análisis de Sistemas II** (UMG, Facultad de Ingeniería en Sistemas) — automatización del proceso de pedidos de un bistro ("Donde Lis") usando **n8n**, con persistencia en **PostgreSQL** y dos sitios web (cliente y administrador) como frontend, todo corriendo localmente con **Docker Compose**.

El sistema permite al bistro publicar su menú del día, recibir pedidos en línea (para domicilio, recoger o comer en mesa), notificar al cliente por correo, administrar disponibilidad de platillos y mesas, y dar seguimiento al estado de cada pedido desde un panel de administración.

## Tabla de contenidos

- [Arquitectura](#arquitectura)
- [Modelo de datos](#modelo-de-datos)
- [Instalación](#instalación)
- [Ejecución](#ejecución)
- [Uso](#uso)
- [Workflows de n8n](#workflows-de-n8n)
- [Seguridad](#seguridad)
- [Manejo de errores y auditoría](#manejo-de-errores-y-auditoría)
- [Pruebas](#pruebas)
- [Estructura del repositorio](#estructura-del-repositorio)

## Arquitectura

Tres contenedores, orquestados con `docker-compose.yml`:

| Servicio | Imagen | Puerto | Rol |
|---|---|---|---|
| `n8n` | `n8nio/n8n:latest` | `5678` | Motor de workflows — expone los 7 webhooks que usa el frontend |
| `postgres` | `postgres:16` | `5432` | Persistencia de datos (menús, pedidos, bitácora, errores) |
| `frontend-cliente` | `nginx:alpine` | `8081` | Sirve el sitio del cliente y, como subcarpeta, el panel de administración |

Los tres contenedores comparten la red interna `dondelis` definida en el compose. El frontend (sitio cliente + panel admin) es HTML/CSS/JS vanilla (sin framework ni build step) que consume los webhooks de n8n directamente desde el navegador.

Zona horaria: tanto el contenedor de n8n (`GENERIC_TIMEZONE`/`TZ=America/Guatemala`) como los valores por defecto de las columnas de fecha en Postgres están configurados para calcular en hora de Guatemala, para evitar el desfase típico de usar la hora UTC por defecto del contenedor.

## Modelo de datos

El esquema completo (tablas, llaves foráneas, restricciones) está en [`docs/schema.sql`](docs/schema.sql), generado con `pg_dump --schema-only` directamente de la base de datos en uso. Resumen de las tablas:

| Tabla | Para qué sirve |
|---|---|
| `platillos` | Catálogo de platillos (nombre, descripción, activo) |
| `menus` | Un menú publicado para una fecha (`fecha_vigencia`) con hora de bloqueo (`hora_bloqueo`) |
| `items_almuerzo` | Platillos de un menú específico, con precio y cantidad disponible |
| `items_desayuno` | Catálogo de ítems de desayuno (precio, disponibilidad) |
| `pedidos` | Cada pedido del cliente: código, datos de contacto, tipo de entrega, estado, total |
| `pedido_items` | Detalle de ítems (almuerzo o desayuno) dentro de cada pedido |
| `configuracion` | Configuración general clave/valor (ej. `mesas_habilitadas`) |
| `bitacora` | Registro de auditoría de operaciones (publicaciones, cambios de estado, notificaciones) |
| `errores` | Registro de errores no controlados, capturados por el workflow global de errores |

## Instalación

Requisitos: Docker y Docker Compose.

```bash
git clone https://github.com/Rodro-31/SistemDeGestioBistroDondeLis.git
cd SistemDeGestioBistroDondeLis
cp .env.example .env
```

Edita `.env` y define `DB_USER`/`DB_PASSWORD` (las credenciales de n8n listadas ahí son solo de referencia para cuando crees tu cuenta de administrador en n8n — Docker Compose no las lee).

Levanta los contenedores:

```bash
docker compose up -d
```

Carga el esquema de la base de datos (las tablas no se crean solas, Postgres arranca vacío):

```bash
docker exec -i <nombre_contenedor_postgres> psql -U <DB_USER> -d dondelis < docs/schema.sql
```

(`docker compose ps` te da el nombre exacto del contenedor de Postgres.)

Importa los workflows en n8n:

1. Entra a `http://localhost:5678` y crea tu cuenta de administrador (primera vez).
2. Para cada archivo de `workflows/01-publicar-menu.json` hasta `07-administrar-pedidos.json`: **Workflows → Import from File**.
3. Configura las credenciales que piden los nodos:
   - **Postgres**: host `postgres`, puerto `5432`, base `dondelis`, usuario/contraseña de tu `.env`.
   - **Header Auth** (para los endpoints protegidos de administración): define un `x-api-key` propio.
   - **SMTP** (Workflow 3, envío de correo de confirmación): credenciales de una cuenta de Gmail (o el proveedor SMTP que prefieras).
4. Activa (**Active**) los 7 workflows.

## Ejecución

Con los contenedores levantados y los workflows activos:

- Sitio del cliente: `http://localhost:8081/`
- Panel de administración: `http://localhost:8081/admin/` (pide el `x-api-key` configurado en la credencial Header Auth, guardado en `sessionStorage` del navegador)
- Editor de n8n: `http://localhost:5678`

Para acceder desde otra máquina en la misma red, reemplaza `localhost` por la IP del servidor (ej. `http://192.168.x.x:8081/`).

## Uso

**Flujo del cliente**: entra al sitio, ve el menú del día (solo platillos vigentes), arma su pedido, elige tipo de entrega (domicilio, recoger o mesa — mesa puede estar deshabilitada por el administrador), completa sus datos y envía. Recibe un código de pedido y un correo de confirmación.

**Flujo del administrador**: entra al panel con la `x-api-key`, y desde ahí:
- **Publicar Menú**: define fecha de vigencia, hora de bloqueo, y los platillos del día con precio y cantidad.
- **Disponibilidad**: habilita/deshabilita pedidos para comer en mesa, y ajusta el stock de cada platillo en tiempo real.
- **Pedidos**: ve todos los pedidos con su resumen de ítems, filtra por código o rango de fechas, y avanza el estado de cada uno (Preparando → Listo → Completado).

Un menú publicado queda visible para el cliente desde el momento en que se publica hasta que pasa su `fecha_vigencia + hora_bloqueo`. No es necesario publicarlo el mismo día de la `fecha_vigencia`: se puede publicar con cualquier anticipación (un día antes, una semana antes, etc.) y seguirá visible durante todo ese tiempo intermedio, hasta llegar exactamente al corte de fecha y hora definido.

## Workflows de n8n

| # | Workflow | Endpoint(s) | Auth | Descripción |
|---|---|---|---|---|
| 1 | Publicar Menú | `POST /publicar-menu` | Header Auth | Crea un menú para una fecha, con sus platillos y precios |
| 2 | Crear Pedido | `POST /crear-pedido` | Público | Valida y registra un pedido del cliente; dispara la notificación en segundo plano |
| 3 | Notificar Pedido | `POST /notificar-pedido` | Header Auth | Envía el correo de confirmación por SMTP |
| 4 | Manejo de Errores Global | (sin webhook — `Error Trigger`) | — | Captura cualquier error no controlado de los otros 6 workflows y lo registra en `errores` |
| 5 | Administrar Disponibilidad | `POST`/`GET /admin/mesas`, `POST /admin/stock` | Header Auth | Habilita/consulta mesas y actualiza stock de platillos |
| 6 | Consultar Menú del Día | `GET /menu-hoy` | Público | Lista los platillos vigentes (usados por el sitio del cliente) |
| 7 | Administrar Pedidos | `GET /pedidos`, `POST /admin/pedidos/estado` | Header Auth | Lista pedidos con resumen de ítems, y actualiza su estado |

Todos apuntan a `http://<host>:5678/webhook/<ruta>`.

## Seguridad

- **Credenciales fuera del código**: usuario/contraseña de Postgres en variables de entorno (`.env`, no versionado — solo `.env.example` con placeholders); la `x-api-key` vive como credencial de n8n, nunca en texto plano en los workflows exportados (el JSON exportado solo guarda una *referencia* a la credencial, no su valor).
- **Control de acceso**: los 5 endpoints de administración (publicar menú, administrar disponibilidad, notificar, administrar pedidos) exigen Header Auth (`x-api-key`); los 2 endpoints de consulta pública del cliente (crear pedido, consultar menú) quedan abiertos a propósito, son los que usa cualquier cliente sin cuenta.
- **Validación de entradas**: cada workflow valida los datos recibidos (fechas, cantidades, estados permitidos, campos requeridos) antes de tocar la base de datos, respondiendo un error controlado en vez de fallar silenciosamente.

## Manejo de errores y auditoría

- **`bitacora`**: registra cada operación relevante (menú publicado, pedido creado, estado actualizado, configuración cambiada, notificación enviada/fallida) con fecha y detalle.
- **`errores`**: cualquier error no controlado en cualquiera de los 6 workflows con webhook se captura automáticamente por el Workflow 4 (`Error Trigger`, configurado como `errorWorkflow` de los otros 6) y queda registrado aquí con el workflow de origen, el mensaje y el payload que lo causó.
- Los errores *esperados* (validación fallida, dato inexistente, estado inválido) no pasan por este camino — responden directamente `{"success": false, "mensaje": "..."}` al cliente, sin registrarse como error del sistema.

## Pruebas

El set formal de pruebas (casos de éxito y de error para los 7 workflows, con los curls exactos y las respuestas esperadas) está en [`docs/curls-pruebas-formales-dondelis.md`](docs/curls-pruebas-formales-dondelis.md), verificado contra el servidor real.

## Estructura del repositorio

```
.
├── docker-compose.yml
├── .env.example
├── docs/
│   ├── schema.sql
│   └── curls-pruebas-formales-dondelis.md
├── frontend/
│   ├── cliente/        # Sitio del cliente (HTML/CSS/JS vanilla)
│   └── admin/           # Panel de administración (HTML/CSS/JS vanilla)
└── workflows/           # Export JSON de los 7 workflows de n8n
```
