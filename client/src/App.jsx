import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Auth/Login';
import Hospitals from './pages/Hospital/Hospitals';
import SocialMediaPublisher from './pages/Post/SocialMediaPublisher';
import Reservations from './pages/Reservation/Reservations';


function App() {
  return (
    <Router>
      <Routes>
        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Main layout routes */}
        <Route path="/" element={<DashboardLayout />}>
          <Route path="reservations" element={<Reservations />} />
          <Route path="hospitals" element={<Hospitals />} />
          <Route path="posts" element={<SocialMediaPublisher />} />
        </Route>

        {/* Default route: redirect to login */}
        <Route index element={<Navigate to="/login" replace />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}

export default App;
