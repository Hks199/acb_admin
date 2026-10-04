import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router';
import Login from './pages/login/Login';
import { hasDemoSession, loginWithDemoCredentials, clearDemoSession } from './lib/demoAuth';
import ParentComponent from './components/ParentComponent';
import CategoryPage from "./pages/category/Categories";
import ProductPage from "./pages/product/Products";
import VarientPage from './pages/varients/Varients';
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
  const [authenticated, setAuthenticated] = useState(hasDemoSession);

  const handleLogin = (userId, password) => {
    if (!loginWithDemoCredentials(userId, password)) return false;
    setAuthenticated(true);
    return true;
  };

  const handleLogout = () => {
    clearDemoSession();
    setAuthenticated(false);
  };

  return (
    <div style={{width:"100%", height:"100vh"}}>
      <BrowserRouter>
          <Routes>
            <Route path="/login" element={authenticated ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />} />
            <Route element={authenticated ? <ParentComponent onLogout={handleLogout}><Outlet /></ParentComponent> : <Navigate to="/login" replace />}>
            <Route path="/" element={<CategoryPage />} />
            <Route path="/products" element={<ProductPage />} />
            <Route path="/varients" element={<VarientPage />} />
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
