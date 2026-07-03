import { createContext, useContext } from 'react';

export const DetailContext = createContext(null);

export function useDetail() {
  return useContext(DetailContext);
}
