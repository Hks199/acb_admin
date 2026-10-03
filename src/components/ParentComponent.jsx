import React, { useState } from 'react';
import Header from './Header';
import SidebarPanel from './SidebarPanel';


const ParentComponent = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`app-shell ${collapsed ? 'navigation-collapsed' : ''}`}>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <SidebarPanel collapsed={collapsed} />
      <div className="app-workspace">
        <Header collapsed={collapsed} setCollapsed={setCollapsed} />
        <main id="main-content" className="app-main" tabIndex={-1}>
          <div className="page-content">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ParentComponent;
