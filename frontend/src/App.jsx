import { useState } from 'react';
import PrestamosScreen from './screens/PrestamosScreen';
import PagosScreen from './screens/PagosScreen';

export default function App() {
  const [screen, setScreen] = useState('prestamos');

  return (
    <>
      <div className="top-nav-shell">
        <nav className="top-nav">
          <button
            type="button"
            className={screen === 'prestamos' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setScreen('prestamos')}
          >
            Mantenimiento
          </button>
          <button
            type="button"
            className={screen === 'pagos' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setScreen('pagos')}
          >
            Pagos parciales
          </button>
        </nav>
      </div>

      {screen === 'prestamos' ? <PrestamosScreen /> : <PagosScreen />}
    </>
  );
}
