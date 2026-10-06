import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router';
import Login from './pages/login/Login';
import { getAdminToken, clearAdminSession, ADMIN_TOKEN_KEY } from './lib/adminAuth';
import api from './api/client';
import Announcements from './pages/announcements/Announcements';
import PopupCampaigns from './pages/promotions/PopupCampaigns';
import ParentComponent from './components/ParentComponent';
import CategoryPage from "./pages/category/Categories";
import ProductPage from "./pages/product/Products";
import VarientPage from './pages/varients/Varients';
import TshirtOffer from './pages/offers/TshirtOffer';
import ImageScreen from './pages/images/ImageScreen';
import VendorScreen from './pages/vendor/VendorScreen';
import RatingsAndReview from './pages/ratings/RatingsAndReview';
import CustomerOrder from './pages/orders/CustomerOrder';
import OrderDetail from './pages/orders/OrderDetail';
import ReturnOrders from './pages/return/ReturnOrders';
import ReturnOrderDetails from './pages/return/ReturnOrderDetails';
import { ToastContainer } from 'react-toastify';
import CancelOrders from './pages/cancel/CancelOrders';
import CancelOrderDetails from './pages/cancel/CancelOrderDetails';


function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const handleLogout = () => {
    clearAdminSession();
    setAuthenticated(false);
  };
  useEffect(() => {
    let mounted = true;
    const expired = () => setAuthenticated(false);
    window.addEventListener('admin-session-expired', expired);
    const check = async () => {
      try {
        if (getAdminToken()) {
          await api.get('admin/session');
          if (mounted) setAuthenticated(true);
        }
      } catch { clearAdminSession(); }
      finally { if (mounted) setCheckingSession(false); }
    };
    check();
    return () => { mounted = false; window.removeEventListener('admin-session-expired', expired); };
  }, []);

  const handleLogin = async (identifier, password) => {
    const response = await api.post('admin/login', { identifier, password });
    sessionStorage.setItem(ADMIN_TOKEN_KEY, response.data.token);
    setAuthenticated(true);
  };
  if (checkingSession) return <p role="status" style={{ padding: 24 }}>Checking admin session...</p>;

  return (
    <div style={{width:"100%", height:"100vh"}}>
      <BrowserRouter>
          <Routes>
            <Route path="/login" element={authenticated ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />} />
            <Route element={authenticated ? <ParentComponent onLogout={handleLogout}><Outlet /></ParentComponent> : <Navigate to="/login" replace />}>
            <Route path="/" element={<CategoryPage />} />
            <Route path="/products" element={<ProductPage />} />
            <Route path="/varients" element={<VarientPage />} />
            <Route path="/promotional-popups" element={<PopupCampaigns />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/tshirt-offer" element={<TshirtOffer />} />
            <Route path="/images" element={<ImageScreen />} />
            <Route path="/vendor" element={<VendorScreen />} />
            <Route path="/ratings" element={<RatingsAndReview />} />
            <Route path="/orders" element={<CustomerOrder />} />
            <Route path="/order-detail" element={<OrderDetail />} />
            <Route path="/return-orders" element={<ReturnOrders />} />
            <Route path="/return-order-details" element={<ReturnOrderDetails />} />
            <Route path="/cancel-orders" element={<CancelOrders />} />
            <Route path="/cancel-order-details" element={<CancelOrderDetails />} />

            <Route path="*" element={<CategoryPage />} />
            </Route>
          </Routes>
      </BrowserRouter>

      <ToastContainer />
    </div>
  )
}

export default App
