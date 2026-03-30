const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const routes = require('./routes');
const swaggerSpec = require('./config/swagger');

const app = express();

app.use(cors());
app.options('*', cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    ok: true,
    message: 'API de prestamos activa',
  });
});

app.get('/api/docs.json', (_req, res) => {
  res.status(200).json(swaggerSpec);
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api', routes);

app.use((err, _req, res, _next) => {
  console.error(err);

  res.status(500).json({
    ok: false,
    message: 'Error interno del servidor',
  });
});

module.exports = app;
