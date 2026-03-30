const express = require('express');
const usuariosRoutes = require('./usuarios.routes');
const tiposPrestamoRoutes = require('./tiposPrestamo.routes');
const prestamosRoutes = require('./prestamos.routes');

const router = express.Router();

router.use('/usuarios', usuariosRoutes);
router.use('/tipos-prestamo', tiposPrestamoRoutes);
router.use('/prestamos', prestamosRoutes);

module.exports = router;
