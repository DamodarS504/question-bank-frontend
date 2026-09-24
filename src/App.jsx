/**
 * src/App.jsx
 * Application router — maps URL paths to page-level components.
 * No layout or UI logic lives here.
 */
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/Landing/LandingPage';
import LoginPage   from './pages/LoginPage';
import SignupPage  from './pages/SignupPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import ProfilePage from './pages/Profile/ProfilePage';
import QuestionsPage from './pages/Questions/QuestionsPage';
import EmployeesPage from './pages/Employees/EmployeesPage';

export default function App() {
  return (
    <Routes>
      <Route path="/"       element={<LandingPage />} />
      <Route path="/login"  element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/questions" element={<QuestionsPage />} />
      <Route path="/employees" element={<EmployeesPage />} />
    </Routes>
  );
}
