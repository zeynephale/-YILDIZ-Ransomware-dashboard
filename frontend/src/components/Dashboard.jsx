import { useState } from 'react';
import Navbar from './Navbar';
import OverviewTab from './OverviewTab';
import GroupsTab from './GroupsTab';
import GeoTab from './GeoTab';
import TimelineTab from './TimelineTab';
import IOCTab from './IOCTab';
import CompareTab from './CompareTab';
import ActorModal from './ActorModal';
import CountryModal from './CountryModal';
import { DetailProvider } from '../context/DetailContext';
import { useDetail } from '../context/detail';
import { c } from '../theme';

function DetailModals() {
  const { actor, country, close } = useDetail();
  return (
    <>
      {actor && <ActorModal name={actor} onClose={close} />}
      {country && <CountryModal code={country.code} name={country.name} onClose={close} />}
    </>
  );
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const render = () => {
    switch (activeTab) {
      case 'overview':  return <OverviewTab />;
      case 'groups':    return <GroupsTab />;
      case 'compare':   return <CompareTab />;
      case 'geo':       return <GeoTab />;
      case 'timeline':  return <TimelineTab />;
      case 'ioc':       return <IOCTab />;
      default:          return <OverviewTab />;
    }
  };

  return (
    <DetailProvider>
    <div style={{ minHeight: '100vh', background: c.bg, position: 'relative' }}>
      <div style={{
        position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '900px', height: '360px', pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse at center top, rgba(59,164,196,0.06), transparent 70%)',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

        <main
          key={activeTab}
          style={{
            maxWidth: '1440px', margin: '0 auto',
            padding: '28px 32px',
            animation: 'fadeUp 0.3s ease forwards',
          }}
        >
          {render()}
        </main>

        <footer style={{
          borderTop: `1px solid ${c.lineSoft}`,
          padding: '18px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px',
          maxWidth: '1440px', margin: '0 auto',
        }}>
          <img src="/loog.png" alt="" style={{ height: '14px', width: '14px', objectFit: 'contain', filter: 'invert(1)', opacity: 0.3 }} />
          <span style={{ fontSize: '10.5px', color: c.faint, letterSpacing: '0.5px' }}>
            © 2026 Yıldız CTI — Tüm hakları saklıdır.
          </span>
        </footer>
      </div>

      <DetailModals />
    </div>
    </DetailProvider>
  );
}
