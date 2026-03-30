const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'Prestamos API',
    version: '1.0.0',
    description: 'Documentacion de la API REST de prestamos',
  },
  servers: [
    {
      url: '/',
      description: 'Servidor actual',
    },
  ],
  tags: [
    { name: 'Health', description: 'Estado de la API' },
    { name: 'Usuarios', description: 'Consulta de usuarios' },
    { name: 'TiposPrestamo', description: 'Consulta de tipos de prestamo' },
    { name: 'Prestamos', description: 'CRUD de prestamos' },
  ],
  components: {
    schemas: {
      Usuario: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          nombre: { type: 'string', example: 'Mama' },
          rol: { type: 'string', example: 'mama' },
        },
      },
      TipoPrestamo: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          nombre: { type: 'string', example: 'Dinero' },
        },
      },
      UsuarioInput: {
        type: 'object',
        required: ['nombre', 'rol'],
        properties: {
          nombre: { type: 'string', example: 'Juan' },
          rol: { type: 'string', enum: ['mamá', 'yo'], example: 'yo' },
        },
      },
      TipoPrestamoInput: {
        type: 'object',
        required: ['nombre'],
        properties: {
          nombre: { type: 'string', example: 'Farmacia' },
        },
      },
      Prestamo: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          usuario_id: { type: 'integer', example: 1 },
          descripcion: { type: 'string', nullable: true, example: 'Prestamo para transporte' },
          monto: { type: 'number', nullable: true, format: 'double', example: 5000 },
          tipo_id: { type: 'integer', example: 1 },
          fecha_creacion: { type: 'string', format: 'date-time' },
        },
      },
      PrestamoDetalle: {
        allOf: [
          { $ref: '#/components/schemas/Prestamo' },
          {
            type: 'object',
            properties: {
              usuario_nombre: { type: 'string', example: 'Mama' },
              usuario_rol: { type: 'string', example: 'mama' },
              tipo_nombre: { type: 'string', example: 'Dinero' },
            },
          },
        ],
      },
      PrestamoInput: {
        type: 'object',
        required: ['usuario_id', 'tipo_id'],
        properties: {
          usuario_id: { type: 'integer', example: 1 },
          descripcion: { type: 'string', nullable: true, example: 'Prestamo para colacion' },
          monto: { type: 'number', nullable: true, format: 'double', example: 2500 },
          tipo_id: { type: 'integer', example: 1 },
        },
      },
      ApiResponseOk: {
        type: 'object',
        properties: {
          ok: { type: 'boolean', example: true },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          ok: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Error interno del servidor' },
        },
      },
    },
  },
  paths: {
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Estado de la API',
        responses: {
          200: {
            description: 'API activa',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponseOk' },
                    {
                      type: 'object',
                      properties: {
                        message: { type: 'string', example: 'API de prestamos activa' },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    '/api/usuarios': {
      get: {
        tags: ['Usuarios'],
        summary: 'Listar usuarios',
        responses: {
          200: {
            description: 'Lista de usuarios',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponseOk' },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Usuario' },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Usuarios'],
        summary: 'Crear usuario',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UsuarioInput' },
            },
          },
        },
        responses: {
          201: {
            description: 'Usuario creado',
          },
          400: {
            description: 'Error de validacion',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/usuarios/{id}': {
      get: {
        tags: ['Usuarios'],
        summary: 'Obtener usuario por id',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: {
            description: 'Usuario encontrado',
          },
          404: {
            description: 'No encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Usuarios'],
        summary: 'Actualizar usuario',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UsuarioInput' },
            },
          },
        },
        responses: {
          200: {
            description: 'Usuario actualizado',
          },
          404: {
            description: 'No encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Usuarios'],
        summary: 'Eliminar usuario',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: {
            description: 'Usuario eliminado',
          },
          404: {
            description: 'No encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          409: {
            description: 'Conflicto por dependencias',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/tipos-prestamo': {
      get: {
        tags: ['TiposPrestamo'],
        summary: 'Listar tipos de prestamo',
        responses: {
          200: {
            description: 'Lista de tipos',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponseOk' },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/TipoPrestamo' },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['TiposPrestamo'],
        summary: 'Crear tipo de prestamo',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TipoPrestamoInput' },
            },
          },
        },
        responses: {
          201: {
            description: 'Tipo creado',
          },
          400: {
            description: 'Error de validacion',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/tipos-prestamo/{id}': {
      get: {
        tags: ['TiposPrestamo'],
        summary: 'Obtener tipo por id',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: {
            description: 'Tipo encontrado',
          },
          404: {
            description: 'No encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      put: {
        tags: ['TiposPrestamo'],
        summary: 'Actualizar tipo de prestamo',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TipoPrestamoInput' },
            },
          },
        },
        responses: {
          200: {
            description: 'Tipo actualizado',
          },
          404: {
            description: 'No encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['TiposPrestamo'],
        summary: 'Eliminar tipo de prestamo',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: {
            description: 'Tipo eliminado',
          },
          404: {
            description: 'No encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          409: {
            description: 'Conflicto por dependencias',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/prestamos': {
      get: {
        tags: ['Prestamos'],
        summary: 'Listar prestamos',
        responses: {
          200: {
            description: 'Lista de prestamos',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponseOk' },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/PrestamoDetalle' },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Prestamos'],
        summary: 'Crear prestamo',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PrestamoInput' },
            },
          },
        },
        responses: {
          201: {
            description: 'Prestamo creado',
          },
          400: {
            description: 'Error de validacion',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/prestamos/{id}': {
      get: {
        tags: ['Prestamos'],
        summary: 'Obtener prestamo por id',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: {
            description: 'Prestamo encontrado',
          },
          404: {
            description: 'No encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Prestamos'],
        summary: 'Actualizar prestamo',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PrestamoInput' },
            },
          },
        },
        responses: {
          200: {
            description: 'Prestamo actualizado',
          },
          404: {
            description: 'No encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Prestamos'],
        summary: 'Eliminar prestamo',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: {
            description: 'Prestamo eliminado',
          },
          404: {
            description: 'No encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
  },
};

const options = {
  definition: swaggerDefinition,
  apis: [],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
