/**
 * src/App.jsx
 * Application router — maps URL paths to page-level components.
 * No layout or UI logic lives here.
 */
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/Landing/LandingPage';
import LoginPage   from './pages/Login/LoginPage';
import SignupPage  from './pages/Signup/SignupPage';

export default function App() {
  return (
    <Routes>
      <Route path="/"       element={<LandingPage />} />
      <Route path="/login"  element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
    </Routes>
  );
}
