const { getPool, sql } = require('../config/db');

async function getUsuarios(_req, res, next) {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT id, nombre, rol FROM usuarios ORDER BY id');

    return res.status(200).json({
      ok: true,
      data: result.recordset,
    });
  } catch (error) {
    return next(error);
  }
}

async function getUsuarioById(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ ok: false, message: 'El id no es valido' });
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query('SELECT id, nombre, rol FROM usuarios WHERE id = @id');

    if (!result.recordset.length) {
      return res.status(404).json({ ok: false, message: 'Usuario no encontrado' });
    }

    return res.status(200).json({ ok: true, data: result.recordset[0] });
  } catch (error) {
    return next(error);
  }
}

async function createUsuario(req, res, next) {
  try {
    const { nombre, rol } = req.body;

    if (!nombre || !rol) {
      return res.status(400).json({ ok: false, message: 'nombre y rol son obligatorios' });
    }

    if (!['mamá', 'yo'].includes(rol)) {
      return res.status(400).json({ ok: false, message: "rol debe ser 'mamá' o 'yo'" });
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input('nombre', sql.NVarChar(100), nombre)
      .input('rol', sql.NVarChar(10), rol)
      .query('INSERT INTO usuarios (nombre, rol) OUTPUT INSERTED.* VALUES (@nombre, @rol)');

    return res.status(201).json({ ok: true, data: result.recordset[0] });
  } catch (error) {
    if (error.number === 547) {
      return res.status(400).json({ ok: false, message: "rol debe ser 'mamá' o 'yo'" });
    }

    return next(error);
  }
}

async function updateUsuario(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { nombre, rol } = req.body;

    if (Number.isNaN(id)) {
      return res.status(400).json({ ok: false, message: 'El id no es valido' });
    }

    if (!nombre || !rol) {
      return res.status(400).json({ ok: false, message: 'nombre y rol son obligatorios' });
    }

    if (!['mamá', 'yo'].includes(rol)) {
      return res.status(400).json({ ok: false, message: "rol debe ser 'mamá' o 'yo'" });
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .input('nombre', sql.NVarChar(100), nombre)
      .input('rol', sql.NVarChar(10), rol)
      .query(`
        UPDATE usuarios
        SET nombre = @nombre,
            rol = @rol
        WHERE id = @id;

        SELECT id, nombre, rol FROM usuarios WHERE id = @id;
      `);

    if (!result.recordset.length) {
      return res.status(404).json({ ok: false, message: 'Usuario no encontrado' });
    }

    return res.status(200).json({ ok: true, data: result.recordset[0] });
  } catch (error) {
    if (error.number === 547) {
      return res.status(400).json({ ok: false, message: "rol debe ser 'mamá' o 'yo'" });
    }

    return next(error);
  }
}

async function deleteUsuario(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ ok: false, message: 'El id no es valido' });
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query('DELETE FROM usuarios OUTPUT DELETED.* WHERE id = @id');

    if (!result.recordset.length) {
      return res.status(404).json({ ok: false, message: 'Usuario no encontrado' });
    }

    return res.status(200).json({
      ok: true,
      message: 'Usuario eliminado',
      data: result.recordset[0],
    });
  } catch (error) {
    if (error.number === 547) {
      return res.status(409).json({
        ok: false,
        message: 'No se puede eliminar el usuario porque tiene prestamos asociados',
      });
    }

    return next(error);
  }
}

module.exports = {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
};
