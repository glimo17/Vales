const { getPool, sql } = require('../config/db');

function isValidMonto(monto) {
  if (monto === null || monto === undefined) {
    return true;
  }

  const parsed = Number(monto);
  return !Number.isNaN(parsed) && parsed >= 0;
}

function isValidPago(monto) {
  const parsed = Number(monto);
  return !Number.isNaN(parsed) && parsed > 0;
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
        p.fecha_creacion,
        COALESCE(SUM(pg.monto), 0) AS total_pagado,
        CASE
          WHEN COALESCE(p.monto, 0) - COALESCE(SUM(pg.monto), 0) < 0 THEN 0
          ELSE COALESCE(p.monto, 0) - COALESCE(SUM(pg.monto), 0)
        END AS saldo_pendiente
      FROM prestamos p
      JOIN usuarios u ON p.usuario_id = u.id
      JOIN tipos_prestamo t ON p.tipo_id = t.id
      LEFT JOIN pagos_prestamo pg ON pg.prestamo_id = p.id
      GROUP BY
        p.id,
        p.usuario_id,
        u.nombre,
        u.rol,
        p.descripcion,
        p.monto,
        p.tipo_id,
        t.nombre,
        p.fecha_creacion
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
          p.fecha_creacion,
          COALESCE(SUM(pg.monto), 0) AS total_pagado,
          CASE
            WHEN COALESCE(p.monto, 0) - COALESCE(SUM(pg.monto), 0) < 0 THEN 0
            ELSE COALESCE(p.monto, 0) - COALESCE(SUM(pg.monto), 0)
          END AS saldo_pendiente
        FROM prestamos p
        JOIN usuarios u ON p.usuario_id = u.id
        JOIN tipos_prestamo t ON p.tipo_id = t.id
          LEFT JOIN pagos_prestamo pg ON pg.prestamo_id = p.id
        WHERE p.id = @id
          GROUP BY
            p.id,
            p.usuario_id,
            u.nombre,
            u.rol,
            p.descripcion,
            p.monto,
            p.tipo_id,
            t.nombre,
            p.fecha_creacion
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

async function getPrestamosResumen(_req, res, next) {
  try {
    const pool = await getPool();
    const prestamosResult = await pool.request().query(`
      SELECT
        p.id,
        p.usuario_id,
        u.nombre AS usuario_nombre,
        u.rol AS usuario_rol,
        p.descripcion,
        p.monto,
        p.tipo_id,
        t.nombre AS tipo_nombre,
        p.fecha_creacion,
        COALESCE(SUM(pg.monto), 0) AS total_pagado,
        CASE
          WHEN COALESCE(p.monto, 0) - COALESCE(SUM(pg.monto), 0) < 0 THEN 0
          ELSE COALESCE(p.monto, 0) - COALESCE(SUM(pg.monto), 0)
        END AS saldo_pendiente
      FROM prestamos p
      JOIN usuarios u ON p.usuario_id = u.id
      JOIN tipos_prestamo t ON p.tipo_id = t.id
      LEFT JOIN pagos_prestamo pg ON pg.prestamo_id = p.id
      GROUP BY
        p.id,
        p.usuario_id,
        u.nombre,
        u.rol,
        p.descripcion,
        p.monto,
        p.tipo_id,
        t.nombre,
        p.fecha_creacion
      ORDER BY p.fecha_creacion DESC
    `);

    const pagosResult = await pool.request().query(`
      SELECT
        id,
        prestamo_id,
        monto,
        observacion,
        fecha_pago
      FROM pagos_prestamo
      ORDER BY fecha_pago DESC, id DESC
    `);

    const pagosByPrestamo = pagosResult.recordset.reduce((acc, pago) => {
      if (!acc[pago.prestamo_id]) {
        acc[pago.prestamo_id] = [];
      }

      acc[pago.prestamo_id].push(pago);
      return acc;
    }, {});

    const data = prestamosResult.recordset.map((prestamo) => ({
      ...prestamo,
      pagos: pagosByPrestamo[prestamo.id] || [],
    }));

    const totales = data.reduce(
      (acc, item) => {
        acc.monto_total += Number(item.monto || 0);
        acc.total_pagado += Number(item.total_pagado || 0);
        acc.saldo_total += Number(item.saldo_pendiente || 0);
        acc.cantidad += 1;
        return acc;
      },
      {
        monto_total: 0,
        total_pagado: 0,
        saldo_total: 0,
        cantidad: 0,
      }
    );

    return res.status(200).json({
      ok: true,
      data,
      totales,
    });
  } catch (error) {
    return next(error);
  }
}

async function createPagoPrestamo(req, res, next) {
  try {
    const prestamoId = Number(req.params.id);
    const { monto, observacion } = req.body;

    if (Number.isNaN(prestamoId)) {
      return res.status(400).json({ ok: false, message: 'El id no es valido' });
    }

    if (!isValidPago(monto)) {
      return res.status(400).json({ ok: false, message: 'El monto del pago debe ser mayor a 0' });
    }

    const pool = await getPool();
    const prestamoResult = await pool
      .request()
      .input('id', sql.Int, prestamoId)
      .query(`
        SELECT
          p.id,
          p.monto,
          COALESCE(SUM(pg.monto), 0) AS total_pagado
        FROM prestamos p
        LEFT JOIN pagos_prestamo pg ON pg.prestamo_id = p.id
        WHERE p.id = @id
        GROUP BY p.id, p.monto
      `);

    if (!prestamoResult.recordset.length) {
      return res.status(404).json({ ok: false, message: 'Prestamo no encontrado' });
    }

    const prestamo = prestamoResult.recordset[0];
    const montoPrestamo = Number(prestamo.monto || 0);
    const totalPagado = Number(prestamo.total_pagado || 0);
    const saldoPendiente = Math.max(montoPrestamo - totalPagado, 0);
    const montoPago = Number(monto);

    if (montoPrestamo <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Solo se pueden registrar pagos en prestamos con monto monetario',
      });
    }

    if (montoPago > saldoPendiente) {
      return res.status(400).json({
        ok: false,
        message: `El pago excede el saldo pendiente de ${saldoPendiente}`,
      });
    }

    const result = await pool
      .request()
      .input('prestamo_id', sql.Int, prestamoId)
      .input('monto', sql.Decimal(18, 2), montoPago)
      .input('observacion', sql.NVarChar(255), observacion || null)
      .query(`
        INSERT INTO pagos_prestamo (prestamo_id, monto, observacion)
        OUTPUT INSERTED.*
        VALUES (@prestamo_id, @monto, @observacion)
      `);

    return res.status(201).json({
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
      .query(`
        DELETE FROM pagos_prestamo WHERE prestamo_id = @id;
        DELETE FROM prestamos OUTPUT DELETED.* WHERE id = @id;
      `);

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
  getPrestamosResumen,
  createPrestamo,
  createPagoPrestamo,
  updatePrestamo,
  deletePrestamo,
};
