const express = require('express');
const {
  getPrestamos,
  getPrestamoById,
  createPrestamo,
  updatePrestamo,
  deletePrestamo,
} = require('../controllers/prestamos.controller');

const router = express.Router();

router.get('/', getPrestamos);
router.get('/:id', getPrestamoById);
router.post('/', createPrestamo);
router.put('/:id', updatePrestamo);
router.delete('/:id', deletePrestamo);

module.exports = router;
