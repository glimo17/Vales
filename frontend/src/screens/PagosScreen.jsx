import { useEffect, useState } from 'react';
import { createPagoPrestamo, getPrestamosResumen } from '../services/api';

function formatCurrency(value) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export default function PagosScreen() {
  const [resumen, setResumen] = useState([]);
  const [totales, setTotales] = useState(null);
  const [forms, setForms] = useState({});
  const [activePrestamo, setActivePrestamo] = useState(null);
  const [expandedHistorial, setExpandedHistorial] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [savingId, setSavingId] = useState(null);

  const loadResumen = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getPrestamosResumen();
      setResumen(response.data || []);
      setTotales(
        response.totales || {
          monto_total: 0,
          total_pagado: 0,
          saldo_total: 0,
          cantidad: 0,
        }
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResumen();
  }, []);

  const updateForm = (prestamoId, field, value) => {
    setForms((prev) => ({
      ...prev,
      [prestamoId]: {
        monto: '',
        observacion: '',
        ...prev[prestamoId],
        [field]: value,
      },
    }));
  };

  const handlePago = async (prestamoId) => {
    const currentForm = forms[prestamoId] || { monto: '', observacion: '' };

    setSavingId(prestamoId);
    setError('');
    setMessage('');

    try {
      await createPagoPrestamo(prestamoId, {
        monto: Number(currentForm.monto),
        observacion: currentForm.observacion?.trim() || null,
      });

      setForms((prev) => ({
        ...prev,
        [prestamoId]: { monto: '', observacion: '' },
      }));
      setActivePrestamo(null);
      setMessage('Pago parcial registrado correctamente.');
      await loadResumen();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  const openPagoDialog = (prestamo) => {
    setActivePrestamo(prestamo);
    setForms((prev) => ({
      ...prev,
      [prestamo.id]: {
        monto: prev[prestamo.id]?.monto || '',
        observacion: prev[prestamo.id]?.observacion || '',
      },
    }));
  };

  const closePagoDialog = () => {
    setActivePrestamo(null);
  };

  const toggleHistorial = (prestamoId) => {
    setExpandedHistorial((prev) => ({
      ...prev,
      [prestamoId]: !prev[prestamoId],
    }));
  };

  return (
    <main className="layout">
      <header className="hero">
        <h1>Resumen y pagos parciales</h1>
        <p>Consulta el total prestado, el saldo pendiente y registra pagos parciales por cada item.</p>
      </header>

      {error ? <div className="alert error">{error}</div> : null}
      {message ? <div className="alert success">{message}</div> : null}

      <section className="summary-grid">
        {loading || !totales ? (
          <>
            <article className="summary-card summary-card-loading">
              <span className="summary-label">Monto total prestado</span>
              <strong>Cargando...</strong>
            </article>
            <article className="summary-card summary-card-loading">
              <span className="summary-label">Total pagado</span>
              <strong>Cargando...</strong>
            </article>
            <article className="summary-card summary-card-loading">
              <span className="summary-label">Saldo pendiente</span>
              <strong>Cargando...</strong>
            </article>
            <article className="summary-card summary-card-loading">
              <span className="summary-label">Cantidad de prestamos</span>
              <strong>Cargando...</strong>
            </article>
          </>
        ) : (
          <>
            <article className="summary-card">
              <span className="summary-label">Monto total prestado</span>
              <strong>{formatCurrency(totales.monto_total)}</strong>
            </article>
            <article className="summary-card">
              <span className="summary-label">Total pagado</span>
              <strong>{formatCurrency(totales.total_pagado)}</strong>
            </article>
            <article className="summary-card">
              <span className="summary-label">Saldo pendiente</span>
              <strong>{formatCurrency(totales.saldo_total)}</strong>
            </article>
            <article className="summary-card">
              <span className="summary-label">Cantidad de prestamos</span>
              <strong>{totales.cantidad}</strong>
            </article>
          </>
        )}
      </section>

      <section className="detail-section">
        <div className="list-header">
          <h2>Detalle de prestamos</h2>
        </div>

        {loading ? <p className="muted">Cargando resumen...</p> : null}
        {!loading && !resumen.length ? <p className="muted">No hay prestamos registrados.</p> : null}

        <div className="loan-stack">
          {resumen.map((prestamo) => {
            const monetaryLoan = Number(prestamo.monto || 0) > 0;
            const saldoPendiente = Number(prestamo.saldo_pendiente || 0);
            const pagos = prestamo.pagos || [];
            const historialVisible = Boolean(expandedHistorial[prestamo.id]);

            return (
              <article className="loan-card" key={prestamo.id}>
                <div className="loan-card-header">
                  <div>
                    <h3>Prestamo #{prestamo.id}</h3>
                    <p>
                      {prestamo.usuario_nombre} · {prestamo.tipo_nombre}
                    </p>
                  </div>
                  <div className="loan-status">
                    <span>Total: {formatCurrency(prestamo.monto)}</span>
                    <span>Pagado: {formatCurrency(prestamo.total_pagado)}</span>
                    <span>Saldo: {formatCurrency(prestamo.saldo_pendiente)}</span>
                  </div>
                </div>

                <div className="loan-meta">
                  <div>
                    <span className="meta-label">Descripcion</span>
                    <strong>{prestamo.descripcion || 'Sin descripcion'}</strong>
                  </div>
                  <div>
                    <span className="meta-label">Fecha</span>
                    <strong>{new Date(prestamo.fecha_creacion).toLocaleString()}</strong>
                  </div>
                </div>

                <div className="loan-body-grid">
                  <section className="payments-panel">
                    <div className="panel-header">
                      <h4>Historial de pagos</h4>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => toggleHistorial(prestamo.id)}
                      >
                        {historialVisible ? 'Ocultar historial' : 'Mostrar historial'}
                      </button>
                    </div>
                    {historialVisible ? (
                      pagos.length ? (
                        <ul className="payments-list">
                          {pagos.map((pago) => (
                            <li key={pago.id} className="payment-item">
                              <div>
                                <strong>{formatCurrency(pago.monto)}</strong>
                                <span>{new Date(pago.fecha_pago).toLocaleString()}</span>
                              </div>
                              <p>{pago.observacion || 'Sin observacion'}</p>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="muted">Aun no hay pagos registrados.</p>
                      )
                    ) : (
                      <p className="muted">Usa el boton para ver el historial de este prestamo.</p>
                    )}
                  </section>

                  <section className="payment-form-panel">
                    <h4>Registrar pago parcial</h4>
                    {monetaryLoan && saldoPendiente > 0 ? (
                      <>
                        <button
                          type="button"
                          className="btn-primary"
                          onClick={() => openPagoDialog(prestamo)}
                        >
                          Registrar pago
                        </button>
                      </>
                    ) : (
                      <div className="note-box">
                        {monetaryLoan
                          ? 'Este prestamo ya fue pagado completamente.'
                          : 'Este item no tiene monto monetario para pagos parciales.'}
                      </div>
                    )}
                  </section>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {activePrestamo ? (
        <div className="dialog-overlay" onClick={closePagoDialog} role="presentation">
          <div
            className="dialog-content"
            role="dialog"
            aria-modal="true"
            aria-label={`Registrar pago del prestamo ${activePrestamo.id}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="form-card">
              <h2>Registrar pago parcial</h2>
              <p className="muted payment-dialog-subtitle">
                Prestamo #{activePrestamo.id} · Saldo pendiente: {formatCurrency(activePrestamo.saldo_pendiente)}
              </p>

              <label>
                Monto a pagar
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={forms[activePrestamo.id]?.monto || ''}
                  onChange={(event) => updateForm(activePrestamo.id, 'monto', event.target.value)}
                  placeholder="Ejemplo: 1000"
                />
              </label>

              <label>
                Observacion
                <input
                  type="text"
                  value={forms[activePrestamo.id]?.observacion || ''}
                  onChange={(event) => updateForm(activePrestamo.id, 'observacion', event.target.value)}
                  placeholder="Pago parcial de hoy"
                />
              </label>

              <div className="actions">
                <button
                  type="button"
                  className="btn-primary"
                  disabled={!forms[activePrestamo.id]?.monto || savingId === activePrestamo.id}
                  onClick={() => handlePago(activePrestamo.id)}
                >
                  {savingId === activePrestamo.id ? 'Guardando...' : 'Confirmar pago'}
                </button>
                <button type="button" className="btn-secondary" onClick={closePagoDialog}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
