import { StrictMode } from 'react';
import { OafProvider } from '../features/oaf/OafContext';
import App from './App';

// Main component definition
const Main = () => {
  return (
    /* StrictMode helps with identifying potential issues in development */
    <StrictMode>
      {/* OafProvider supplies context to the App */}
      <OafProvider>
        <App />
      </OafProvider>
    </StrictMode>
  );
};

export default Main;
