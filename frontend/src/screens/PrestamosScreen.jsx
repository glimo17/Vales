import { useEffect, useState } from 'react';
import PrestamoForm from '../components/PrestamoForm';
import PrestamoList from '../components/PrestamoList';
import {
  createPrestamo,
  deletePrestamo,
  getPrestamos,
  getTiposPrestamo,
  getUsuarios,
  updatePrestamo,
} from '../services/api';

export default function PrestamosScreen() {
  const [prestamos, setPrestamos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const [prestamosRes, usuariosRes, tiposRes] = await Promise.all([
        getPrestamos(),
        getUsuarios(),
        getTiposPrestamo(),
      ]);

      setPrestamos(prestamosRes.data || []);
      setUsuarios(usuariosRes.data || []);
      setTipos(tiposRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (payload) => {
    setError('');
    setMessage('');

    try {
      if (selected) {
        await updatePrestamo(selected.id, payload);
        setMessage('Prestamo actualizado correctamente.');
      } else {
        await createPrestamo(payload);
        setMessage('Prestamo creado correctamente.');
      }

      setSelected(null);
      setIsDialogOpen(false);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const openCreateDialog = () => {
    setSelected(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (prestamo) => {
    setSelected(prestamo);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setSelected(null);
    setIsDialogOpen(false);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Desea eliminar este prestamo?');
    if (!confirmed) {
      return;
    }

    setError('');
    setMessage('');

    try {
      await deletePrestamo(id);
      setMessage('Prestamo eliminado correctamente.');
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="layout">
      <header className="hero">
        <h1>Website - Mantenimiento de Prestamos</h1>
      </header>

      {error ? <div className="alert error">{error}</div> : null}
      {message ? <div className="alert success">{message}</div> : null}

      <section className="list-card">
        <div className="list-header">
          <h2>Listado de prestamos</h2>
          <button type="button" className="btn-primary" onClick={openCreateDialog}>
            Nuevo prestamo
          </button>
        </div>
        <PrestamoList
          prestamos={prestamos}
          onEdit={openEditDialog}
          onDelete={handleDelete}
          loading={loading}
        />
      </section>

      {isDialogOpen ? (
        <div className="dialog-overlay" onClick={closeDialog} role="presentation">
          <div
            className="dialog-content"
            role="dialog"
            aria-modal="true"
            aria-label={selected ? 'Editar prestamo' : 'Nuevo prestamo'}
            onClick={(event) => event.stopPropagation()}
          >
            <PrestamoForm
              usuarios={usuarios}
              tipos={tipos}
              selected={selected}
              onSubmit={handleSubmit}
              onCancel={closeDialog}
            />
          </div>
        </div>
      ) : null}
    </main>
  );
}
