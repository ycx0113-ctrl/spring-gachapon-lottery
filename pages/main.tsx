import React from 'react';
import { createRoot } from 'react-dom/client';
import { LotteryApp } from '@/components/lottery/LotteryApp';
import '@/app/globals.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LotteryApp />
  </React.StrictMode>,
);
