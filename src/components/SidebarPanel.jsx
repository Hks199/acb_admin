import { NavLink } from 'react-router';
import { createElement } from 'react';
import { BiCategory } from 'react-icons/bi';
import { FiBox, FiImage, FiUsers, FiStar, FiShoppingBag, FiLayers, FiRotateCcw, FiXCircle, FiFeather } from 'react-icons/fi';

const groups = [
  { label: 'Catalog', items: [
    ['/', 'Categories', BiCategory], ['/products', 'Products', FiBox],
    ['/varients', 'Variants', FiLayers], ['/tshirt-offer', 'T-shirt offer', FiShoppingBag], ['/images', 'Image library', FiImage],
    ['/vendor', 'Vendors', FiUsers],
  ] },
  { label: 'Store management', items: [
    ['/announcements', 'Announcements', FiFeather],
    ['/orders', 'Orders', FiShoppingBag], ['/ratings', 'Ratings & reviews', FiStar],
    ['/cancel-orders', 'Cancellations', FiXCircle], ['/return-orders', 'Returns', FiRotateCcw],
  ] },
];

const SidebarPanel = ({ collapsed }) => (
  <aside id="primary-navigation" className={`app-sidebar ${collapsed ? 'is-collapsed' : ''}`}>
    <NavLink to="/" className="brand" aria-label="Art & Craft home">
      <span className="brand-mark"><FiFeather /></span>
      <span className="sidebar-copy">Art & Craft<small>ADMIN STUDIO</small></span>
    </NavLink>
    <nav aria-label="Main navigation">
      {groups.map(group => (
        <div className="nav-group" key={group.label}>
          <p className="nav-group-label sidebar-copy">{group.label}</p>
          {group.items.map(([path, label, icon]) => (
            <NavLink key={path} to={path} end title={label} className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}>
              {createElement(icon, { 'aria-hidden': true })}<span className="sidebar-copy">{label}</span>
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
    <div className="sidebar-footer"><span className="footer-monogram">AC</span><span className="sidebar-copy">Made for your craft<small>Your store, thoughtfully managed.</small></span></div>
  </aside>
);

export default SidebarPanel;
