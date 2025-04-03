import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext'; // Import the AuthProvider
import { BrowserRouter } from "react-router-dom";
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider> {/* Wrap your entire app with AuthProvider */}
      <App />
    </AuthProvider>
  </BrowserRouter>
);


