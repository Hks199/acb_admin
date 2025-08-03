import React, { useState } from 'react';
import Header from './Header';
import SidebarPanel from './SidebarPanel';


const ParentComponent = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className='w-full'>
      <Header collapsed={collapsed} setCollapsed={setCollapsed} />
      <div style={{ display: 'flex', height: '100%' }}>
        <SidebarPanel collapsed={collapsed} />

        <main className='w-full'>
          <div style={{ flex: 1, padding:15, overflow: 'auto' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ParentComponent;