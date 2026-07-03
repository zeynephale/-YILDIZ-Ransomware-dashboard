import { useState, useEffect, useCallback } from 'react';
import BootScreen from './components/BootScreen';
import Dashboard from './components/Dashboard';
import { AlertTriangle } from 'lucide-react';
import { loadDataset } from './data/ransomwareData';
import { c } from './theme';
import './index.css';

export default function App() {
  const [booted, setBooted] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDataset()
      .then(() => setDataReady(true))
      .catch(err => setError(err.message));
  }, []);

  const handleBootComplete = useCallback(() => setBooted(true), []);

  if (error) {
    return (
      <div style={{
        minHeight: '100vh', background: c.bg, color: c.textMut,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '10px', textAlign: 'center', padding: '24px',
      }}>
        <div style={{ color: c.crit, fontSize: '13px', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={16} /> Could not reach the CTI backend
        </div>
        <div style={{ fontSize: '11px', color: c.textDim }}>{error}</div>
        <div style={{ fontSize: '11px', color: c.faint }}>
          Make sure the API is running on <span style={{ color: c.accentHi }}>:8080</span>.
        </div>
      </div>
    );
  }

  const ready = booted && dataReady;

  return (
    <>
      {!ready && <BootScreen onComplete={handleBootComplete} />}
      {ready && (
        <div style={{ animation: 'fadeIn 0.8s ease forwards' }}>
          <Dashboard />
        </div>
      )}
    </>
  );
}
