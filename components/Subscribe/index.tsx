import { useEffect } from 'react';

export default function Subscribe({ callback }) {
  useEffect(() => callback(), []);
  return null;
}
