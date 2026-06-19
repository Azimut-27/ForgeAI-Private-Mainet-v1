import React from 'react';
import { createRoot } from 'react-dom/client';
import WorkoutGenerator from './WorkoutGenerator.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WorkoutGenerator />
  </React.StrictMode>
);
