class Prestamo {
  constructor({ id, usuario_id, descripcion, monto, tipo_id, fecha_creacion }) {
    this.id = id;
    this.usuario_id = usuario_id;
    this.descripcion = descripcion;
    this.monto = monto;
    this.tipo_id = tipo_id;
    this.fecha_creacion = fecha_creacion;
  }
}

module.exports = Prestamo;
