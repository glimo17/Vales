# API de Prestamos (Node.js + Express + SQL Server)

API REST para consumir la base de datos `PrestamosDB`.

## 1) Requisitos

- Node.js 18+
- SQL Server

## 2) Configurar base de datos

Ejecuta el script:

- `database/init.sql`

## 3) Configurar variables de entorno

1. Copia `.env.example` a `.env`
2. Ajusta credenciales de SQL Server

Variables:

- `PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_SERVER`
- `DB_NAME`
- `DB_PORT`
- `DB_ENCRYPT`
- `DB_TRUST_SERVER_CERT`

## 4) Instalar y ejecutar

```bash
npm install
npm run dev
```

Servidor:

- `http://localhost:3000`

Health check:

- `GET /api/health`

Swagger:

- UI: `http://localhost:3000/api/docs`
- JSON: `http://localhost:3000/api/docs.json`

Nota:

- Si ejecutas en otro puerto (por ejemplo 3001), usa esa misma URL para `/api/docs`.
- La API tiene CORS habilitado para pruebas desde frontend u otros orígenes.

## 5) Endpoints

### Usuarios

- `GET /api/usuarios`
- `GET /api/usuarios/:id`
- `POST /api/usuarios`
- `PUT /api/usuarios/:id`
- `DELETE /api/usuarios/:id`

### Tipos de prestamo

- `GET /api/tipos-prestamo`
- `GET /api/tipos-prestamo/:id`
- `POST /api/tipos-prestamo`
- `PUT /api/tipos-prestamo/:id`
- `DELETE /api/tipos-prestamo/:id`

### Prestamos

- `GET /api/prestamos`
- `GET /api/prestamos/:id`
- `POST /api/prestamos`
- `PUT /api/prestamos/:id`
- `DELETE /api/prestamos/:id`

Ejemplo body para crear/actualizar prestamo:

```json
{
  "usuario_id": 1,
  "descripcion": "Prestamo para colacion",
  "monto": 2500,
  "tipo_id": 1
}
```
