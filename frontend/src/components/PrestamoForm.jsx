import { useEffect, useState } from 'react';

const initialForm = {
  usuario_id: '',
  descripcion: '',
  monto: '',
  tipo_id: '',
};

export default function PrestamoForm({ usuarios, tipos, selected, onSubmit, onCancel }) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (!selected) {
      setForm(initialForm);
      return;
    }

    setForm({
      usuario_id: String(selected.usuario_id),
      descripcion: selected.descripcion || '',
      monto: selected.monto ?? '',
      tipo_id: String(selected.tipo_id),
    });
  }, [selected]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit({
      usuario_id: Number(form.usuario_id),
      descripcion: form.descripcion.trim() || null,
      monto: form.monto === '' ? null : Number(form.monto),
      tipo_id: Number(form.tipo_id),
    });
  };

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h2>{selected ? 'Editar prestamo' : 'Nuevo prestamo'}</h2>

      <label>
        Usuario
        <select name="usuario_id" value={form.usuario_id} onChange={handleChange} required>
          <option value="">Seleccione un usuario</option>
          {usuarios.map((usuario) => (
            <option key={usuario.id} value={usuario.id}>
              {usuario.nombre} ({usuario.rol})
            </option>
          ))}
        </select>
      </label>

      <label>
        Tipo de prestamo
        <select name="tipo_id" value={form.tipo_id} onChange={handleChange} required>
          <option value="">Seleccione un tipo</option>
          {tipos.map((tipo) => (
            <option key={tipo.id} value={tipo.id}>
              {tipo.nombre}
            </option>
          ))}
        </select>
      </label>

      <label>
        Descripcion
        <input
          name="descripcion"
          type="text"
          value={form.descripcion}
          onChange={handleChange}
          placeholder="Ejemplo: Prestamo para transporte"
        />
      </label>

      <label>
        Monto
        <input
          name="monto"
          type="number"
          min="0"
          step="0.01"
          value={form.monto}
          onChange={handleChange}
          placeholder="Ejemplo: 5000"
        />
      </label>

      <div className="actions">
        <button type="submit" className="btn-primary">
          {selected ? 'Actualizar' : 'Guardar'}
        </button>
        {onCancel ? (
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  );
}
