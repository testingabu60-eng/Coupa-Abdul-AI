import { createRoot } from 'react-dom/client';
import React from 'react';
import '../styles/index.css';
import Main from './app/Main.jsx';

createRoot(document.getElementById('root')).render(React.createElement(Main));
