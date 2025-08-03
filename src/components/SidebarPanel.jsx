import React, { useState } from 'react';
import { Sidebar, Menu, MenuItem, menuClasses} from 'react-pro-sidebar';
import { Link } from 'react-router';
import { BiCategory } from "react-icons/bi";
import { MdOutlineShoppingCart } from "react-icons/md";
import { IoBarChartOutline } from "react-icons/io5";
import { IoMdImages } from "react-icons/io";
import { HiMiniUserGroup } from "react-icons/hi2";
import { FaStarHalfAlt, FaBoxes } from "react-icons/fa";

import { BsBox2 } from "react-icons/bs";
import { TbTruckReturn } from "react-icons/tb";


const themes = {
  light: {
    sidebar: {
      backgroundColor: '#ffffff',
      color: '#000000',
    },
    menu: {
      menuContent: '#fbfcfd',
      icon: '#000000',
      hover: {
        backgroundColor: '#c5e4ff',
        color: '#44596e',
      },
      disabled: {
        color: '#9fb6cf',
      },
    },
  },
  dark: {
    sidebar: {
      backgroundColor: '#0b2948',
      color: '#8ba1b7',
    },
    menu: {
      menuContent: '#082440',
      icon: '#59d0ff',
      hover: {
        backgroundColor: '#00458b',
        color: '#b6c8d9',
      },
      disabled: {
        color: '#3e5e7e',
      },
    },
  },
};

// hex to rgba converter
const hexToRgba = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const SidebarPanel = ({ collapsed }) => {
  const [toggled, setToggled] = useState(false);
  const [broken, setBroken] = useState(false);
  const [hasImage, setHasImage] = useState(false);
  const [theme, setTheme] = useState('light');


  const menuItemStyles = {
    root: {
      fontSize: '13px',
      fontWeight: 400,
    },
    icon: {
      color: themes[theme].menu.icon,
      [`&.${menuClasses.disabled}`]: {
        color: themes[theme].menu.disabled.color,
      },
    },
    SubMenuExpandIcon: {
      color: '#b6b7b9',
    },
    subMenuContent: ({ level }) => ({
      backgroundColor:
        level === 0
          ? hexToRgba(themes[theme].menu.menuContent, hasImage && !collapsed ? 0.4 : 1)
          : 'transparent',
    }),
    button: {
      [`&.${menuClasses.disabled}`]: {
        color: themes[theme].menu.disabled.color,
      },
      '&:hover': {
        backgroundColor: hexToRgba(themes[theme].menu.hover.backgroundColor, hasImage ? 0.8 : 1),
        color: themes[theme].menu.hover.color,
      },
    },
    label: ({ open }) => ({
      fontWeight: open ? 600 : undefined,
    }),
  };

  return (
        <Sidebar
          collapsed={collapsed}
          toggled={toggled}
          onBackdropClick={() => setToggled(false)}
          onBreakPoint={setBroken}
          breakPoint="md"
          backgroundColor={hexToRgba(themes[theme].sidebar.backgroundColor, hasImage ? 0.9 : 1)}
          rootStyles={{
            color: themes[theme].sidebar.color,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ flex: 1, marginBottom: '32px' }}>

              <Menu menuItemStyles={menuItemStyles}>
                <MenuItem icon={<BiCategory />} component={<Link to="/" />} style={{fontSize:20}}> Categories</MenuItem>
                <MenuItem icon={<MdOutlineShoppingCart />} component={<Link to="/products" />} style={{fontSize:20}}> Products</MenuItem>
                <MenuItem icon={<IoBarChartOutline />} component={<Link to="/varients" />} style={{fontSize:20}}> Varients</MenuItem>
                <MenuItem icon={<IoMdImages />} component={<Link to="/images" />} style={{fontSize:20}}> Images</MenuItem>
                <MenuItem icon={<HiMiniUserGroup />} component={<Link to="/vendor" />} style={{fontSize:20}}> Vendors</MenuItem>
                <MenuItem icon={<BsBox2 />} component={<Link to="/orders" />} style={{fontSize:20}}> Orders</MenuItem>
                <MenuItem icon={<FaStarHalfAlt />} component={<Link to="/ratings" />} style={{fontSize:20}}> Ratings & Reviews</MenuItem>
                <MenuItem icon={<FaBoxes />} component={<Link to="/cancel-orders" />} style={{fontSize:20}}> Cancel Orders</MenuItem>
                <MenuItem icon={<TbTruckReturn />} component={<Link to="/return-orders" />} style={{fontSize:20}}> Return Orders</MenuItem>
              </Menu>

            </div>
          </div>
      </Sidebar>
  );
};

export default SidebarPanel;