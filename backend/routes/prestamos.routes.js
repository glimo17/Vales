const express = require('express');
const {
  getPrestamos,
  getPrestamoById,
  getPrestamosResumen,
  createPrestamo,
  createPagoPrestamo,
  updatePrestamo,
  deletePrestamo,
} = require('../controllers/prestamos.controller');

const router = express.Router();

router.get('/resumen', getPrestamosResumen);
router.get('/', getPrestamos);
router.get('/:id', getPrestamoById);
router.post('/:id/pagos', createPagoPrestamo);
router.post('/', createPrestamo);
router.put('/:id', updatePrestamo);
router.delete('/:id', deletePrestamo);

module.exports = router;
