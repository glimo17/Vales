export default function PrestamoList({ prestamos, onEdit, onDelete, loading }) {
  if (loading) {
    return <p className="muted">Cargando prestamos...</p>;
  }

  if (!prestamos.length) {
    return <p className="muted">No hay prestamos registrados.</p>;
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Usuario</th>
            <th>Descripcion</th>
            <th>Monto</th>
            <th>Tipo</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {prestamos.map((prestamo) => (
            <tr key={prestamo.id}>
              <td data-label="ID">{prestamo.id}</td>
              <td data-label="Usuario">{prestamo.usuario_nombre}</td>
              <td data-label="Descripcion">{prestamo.descripcion || '-'}</td>
              <td data-label="Monto">{prestamo.monto ?? '-'}</td>
              <td data-label="Tipo">{prestamo.tipo_nombre}</td>
              <td data-label="Fecha">{new Date(prestamo.fecha_creacion).toLocaleString()}</td>
              <td data-label="Acciones" className="actions-cell">
                <button className="btn-secondary" onClick={() => onEdit(prestamo)}>
                  Editar
                </button>
                <button className="btn-danger" onClick={() => onDelete(prestamo.id)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
