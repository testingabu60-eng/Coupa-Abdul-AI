// src/app/App.jsx
import React from 'react';
import MainView from '../features/ui/views/MainView';
import OafNavigation from '../features/navigation/OafNavigation';
import '../../styles/app.css';

const App = () => (
  <>
    <MainView />
    {/* Add the OAF Navigation panel anywhere you want on the page */}
    <div style={{ padding: 20 }}>
      <OafNavigation />
    </div>
  </>
);

export default App;