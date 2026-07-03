import { useState, useCallback } from 'react';
import { DetailContext } from './detail';

export function DetailProvider({ children }) {
  const [actor, setActor] = useState(null);
  const [country, setCountry] = useState(null);

  const openActor = useCallback((name) => { setCountry(null); setActor(name); }, []);
  const openCountry = useCallback((code, name) => { setActor(null); setCountry({ code, name }); }, []);
  const close = useCallback(() => { setActor(null); setCountry(null); }, []);

  return (
    <DetailContext.Provider value={{ actor, country, openActor, openCountry, close }}>
      {children}
    </DetailContext.Provider>
  );
}
