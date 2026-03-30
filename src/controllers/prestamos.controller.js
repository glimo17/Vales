const { getPool, sql } = require('../config/db');

function isValidMonto(monto) {
  if (monto === null || monto === undefined) {
    return true;
  }

  const parsed = Number(monto);
  return !Number.isNaN(parsed) && parsed >= 0;
}

async function getPrestamos(_req, res, next) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        p.id,
        p.usuario_id,
        u.nombre AS usuario_nombre,
        u.rol AS usuario_rol,
        p.descripcion,
        p.monto,
        p.tipo_id,
        t.nombre AS tipo_nombre,
        p.fecha_creacion
      FROM prestamos p
      JOIN usuarios u ON p.usuario_id = u.id
      JOIN tipos_prestamo t ON p.tipo_id = t.id
      ORDER BY p.fecha_creacion DESC
    `);

    return res.status(200).json({
      ok: true,
      data: result.recordset,
    });
  } catch (error) {
    return next(error);
  }
}

async function getPrestamoById(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ ok: false, message: 'El id no es valido' });
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query(`
        SELECT
          p.id,
          p.usuario_id,
          u.nombre AS usuario_nombre,
          u.rol AS usuario_rol,
          p.descripcion,
          p.monto,
          p.tipo_id,
          t.nombre AS tipo_nombre,
          p.fecha_creacion
        FROM prestamos p
        JOIN usuarios u ON p.usuario_id = u.id
        JOIN tipos_prestamo t ON p.tipo_id = t.id
        WHERE p.id = @id
      `);

    if (!result.recordset.length) {
      return res.status(404).json({ ok: false, message: 'Prestamo no encontrado' });
    }

    return res.status(200).json({
      ok: true,
      data: result.recordset[0],
    });
  } catch (error) {
    return next(error);
  }
}

async function createPrestamo(req, res, next) {
  try {
    const { usuario_id, descripcion, monto, tipo_id } = req.body;

    if (!usuario_id || !tipo_id) {
      return res.status(400).json({
        ok: false,
        message: 'usuario_id y tipo_id son obligatorios',
      });
    }

    if (!isValidMonto(monto)) {
      return res.status(400).json({
        ok: false,
        message: 'monto debe ser un numero mayor o igual a 0 o null',
      });
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input('usuario_id', sql.Int, Number(usuario_id))
      .input('descripcion', sql.NVarChar(255), descripcion || null)
      .input('monto', sql.Decimal(18, 2), monto !== undefined && monto !== null ? Number(monto) : null)
      .input('tipo_id', sql.Int, Number(tipo_id))
      .query(`
        INSERT INTO prestamos (usuario_id, descripcion, monto, tipo_id)
        OUTPUT INSERTED.*
        VALUES (@usuario_id, @descripcion, @monto, @tipo_id)
      `);

    return res.status(201).json({
      ok: true,
      data: result.recordset[0],
    });
  } catch (error) {
    if (error.number === 547) {
      return res.status(400).json({
        ok: false,
        message: 'usuario_id o tipo_id no existen',
      });
    }

    return next(error);
  }
}

async function updatePrestamo(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { usuario_id, descripcion, monto, tipo_id } = req.body;

    if (Number.isNaN(id)) {
      return res.status(400).json({ ok: false, message: 'El id no es valido' });
    }

    if (!usuario_id || !tipo_id) {
      return res.status(400).json({
        ok: false,
        message: 'usuario_id y tipo_id son obligatorios',
      });
    }

    if (!isValidMonto(monto)) {
      return res.status(400).json({
        ok: false,
        message: 'monto debe ser un numero mayor o igual a 0 o null',
      });
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .input('usuario_id', sql.Int, Number(usuario_id))
      .input('descripcion', sql.NVarChar(255), descripcion || null)
      .input('monto', sql.Decimal(18, 2), monto !== undefined && monto !== null ? Number(monto) : null)
      .input('tipo_id', sql.Int, Number(tipo_id))
      .query(`
        UPDATE prestamos
        SET usuario_id = @usuario_id,
            descripcion = @descripcion,
            monto = @monto,
            tipo_id = @tipo_id
        WHERE id = @id;

        SELECT * FROM prestamos WHERE id = @id;
      `);

    if (!result.recordset.length) {
      return res.status(404).json({ ok: false, message: 'Prestamo no encontrado' });
    }

    return res.status(200).json({
      ok: true,
      data: result.recordset[0],
    });
  } catch (error) {
    if (error.number === 547) {
      return res.status(400).json({
        ok: false,
        message: 'usuario_id o tipo_id no existen',
      });
    }

    return next(error);
  }
}

async function deletePrestamo(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ ok: false, message: 'El id no es valido' });
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query('DELETE FROM prestamos OUTPUT DELETED.* WHERE id = @id');

    if (!result.recordset.length) {
      return res.status(404).json({ ok: false, message: 'Prestamo no encontrado' });
    }

    return res.status(200).json({
      ok: true,
      message: 'Prestamo eliminado',
      data: result.recordset[0],
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getPrestamos,
  getPrestamoById,
  createPrestamo,
  updatePrestamo,
  deletePrestamo,
};
