const express = require('express');
const {
	getTiposPrestamo,
	getTipoPrestamoById,
	createTipoPrestamo,
	updateTipoPrestamo,
	deleteTipoPrestamo,
} = require('../controllers/tiposPrestamo.controller');

const router = express.Router();

router.get('/', getTiposPrestamo);
router.get('/:id', getTipoPrestamoById);
router.post('/', createTipoPrestamo);
router.put('/:id', updateTipoPrestamo);
router.delete('/:id', deleteTipoPrestamo);

module.exports = router;
