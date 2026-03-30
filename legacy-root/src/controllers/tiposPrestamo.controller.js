const { getPool, sql } = require('../config/db');

async function getTiposPrestamo(_req, res, next) {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT id, nombre FROM tipos_prestamo ORDER BY id');

    return res.status(200).json({
      ok: true,
      data: result.recordset,
    });
  } catch (error) {
    return next(error);
  }
}

async function getTipoPrestamoById(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ ok: false, message: 'El id no es valido' });
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query('SELECT id, nombre FROM tipos_prestamo WHERE id = @id');

    if (!result.recordset.length) {
      return res.status(404).json({ ok: false, message: 'Tipo de prestamo no encontrado' });
    }

    return res.status(200).json({ ok: true, data: result.recordset[0] });
  } catch (error) {
    return next(error);
  }
}

async function createTipoPrestamo(req, res, next) {
  try {
    const { nombre } = req.body;

    if (!nombre) {
      return res.status(400).json({ ok: false, message: 'nombre es obligatorio' });
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input('nombre', sql.NVarChar(50), nombre)
      .query('INSERT INTO tipos_prestamo (nombre) OUTPUT INSERTED.* VALUES (@nombre)');

    return res.status(201).json({ ok: true, data: result.recordset[0] });
  } catch (error) {
    return next(error);
  }
}

async function updateTipoPrestamo(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { nombre } = req.body;

    if (Number.isNaN(id)) {
      return res.status(400).json({ ok: false, message: 'El id no es valido' });
    }

    if (!nombre) {
      return res.status(400).json({ ok: false, message: 'nombre es obligatorio' });
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .input('nombre', sql.NVarChar(50), nombre)
      .query(`
        UPDATE tipos_prestamo
        SET nombre = @nombre
        WHERE id = @id;

        SELECT id, nombre FROM tipos_prestamo WHERE id = @id;
      `);

    if (!result.recordset.length) {
      return res.status(404).json({ ok: false, message: 'Tipo de prestamo no encontrado' });
    }

    return res.status(200).json({ ok: true, data: result.recordset[0] });
  } catch (error) {
    return next(error);
  }
}

async function deleteTipoPrestamo(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ ok: false, message: 'El id no es valido' });
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query('DELETE FROM tipos_prestamo OUTPUT DELETED.* WHERE id = @id');

    if (!result.recordset.length) {
      return res.status(404).json({ ok: false, message: 'Tipo de prestamo no encontrado' });
    }

    return res.status(200).json({
      ok: true,
      message: 'Tipo de prestamo eliminado',
      data: result.recordset[0],
    });
  } catch (error) {
    if (error.number === 547) {
      return res.status(409).json({
        ok: false,
        message: 'No se puede eliminar el tipo porque tiene prestamos asociados',
      });
    }

    return next(error);
  }
}

module.exports = {
  getTiposPrestamo,
  getTipoPrestamoById,
  createTipoPrestamo,
  updateTipoPrestamo,
  deleteTipoPrestamo,
};
