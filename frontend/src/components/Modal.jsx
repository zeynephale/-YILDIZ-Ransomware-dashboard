import { useEffect } from 'react';
import { X } from 'lucide-react';
import { c } from '../theme';

export default function Modal({ onClose, children, maxWidth = 720 }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(3,6,12,0.72)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '48px 20px', overflowY: 'auto',
        animation: 'fadeIn 0.2s ease forwards',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative', width: '100%', maxWidth,
          background: c.panel, border: `1px solid ${c.lineHi}`,
          borderRadius: '12px', boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          animation: 'fadeUp 0.25s ease forwards',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute', top: '14px', right: '14px', zIndex: 2,
            width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: c.bgElev, border: `1px solid ${c.line}`, borderRadius: '7px',
            color: c.textDim, cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = c.text; e.currentTarget.style.borderColor = c.lineHi; }}
          onMouseLeave={e => { e.currentTarget.style.color = c.textDim; e.currentTarget.style.borderColor = c.line; }}
        >
          <X size={16} />
        </button>
        {children}
      </div>
    </div>
  );
}
