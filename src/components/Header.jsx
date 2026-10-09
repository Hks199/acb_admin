import { FaBars } from 'react-icons/fa6';
import { FiChevronRight, FiLogOut } from 'react-icons/fi';
import { useLocation } from 'react-router';

const pageNames = {
  '/': 'Categories', '/products': 'Products', '/varients': 'Variants',
  '/images': 'Image library', '/vendor': 'Vendors', '/ratings': 'Ratings & reviews',
  '/promotional-popups': 'Promotional popups',
  '/announcements': 'Announcements',
  '/faqs': 'FAQs',
  '/tshirt-offer': 'T-shirt offer',
  '/discount-rules': 'Discount & Offers Setup',
  '/orders': 'Orders', '/order-detail': 'Order details',
  '/return-orders': 'Returns', '/return-order-details': 'Return details',
  '/cancel-orders': 'Cancellations', '/cancel-order-details': 'Cancellation details',
};

const Header = ({ collapsed, setCollapsed, onLogout }) => {
  const { pathname } = useLocation();
  return (
    <header className="app-header">
      <div className="header-leading">
        <button className="menu-toggle" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'} aria-expanded={!collapsed} aria-controls="primary-navigation">
          <FaBars />
        </button>
        <div className="breadcrumb"><span>Workspace</span><FiChevronRight aria-hidden="true" /><strong>{pageNames[pathname] || 'Categories'}</strong></div>
      </div>
      <div className="workspace-profile">
        <span className="workspace-label">Art & Craft <small>Store administration</small></span>
        <span className="avatar" aria-hidden="true">AC</span>
        <button className="logout-button" onClick={onLogout} type="button"><FiLogOut aria-hidden="true" /><span>Logout</span></button>
      </div>
    </header>
  );
};

export default Header;
