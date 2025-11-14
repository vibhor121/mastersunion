import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getSocket } from './config/socket';
import { addNotification } from './store/slices/notificationSlice';
import { toast } from 'react-toastify';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import LeadDetail from './pages/LeadDetail';
import Activities from './pages/Activities';
import Notifications from './pages/Notifications';

// Components
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      const socket = getSocket();
      
      if (socket) {
        // Listen for real-time notifications
        socket.on('notification:new', (notification) => {
          dispatch(addNotification(notification));
          toast.info(notification.message);
        });

        // Listen for lead updates
        socket.on('lead:changed', (data) => {
          toast.info(`Lead ${data.leadName} has been updated`);
        });

        // Listen for activity updates
        socket.on('activity:new', (data) => {
          toast.info(`New activity added for ${data.leadName}`);
        });
      }
    }
  }, [isAuthenticated, dispatch]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="leads" element={<Leads />} />
        <Route path="leads/:id" element={<LeadDetail />} />
        <Route path="activities" element={<Activities />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

