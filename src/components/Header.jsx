import React from 'react';
import { FaBars } from "react-icons/fa6";

const Header = ({ collapsed, setCollapsed }) => {
  return (
    <div style={{height:"7vh", width:"100%", backgroundColor:"#237bd7"}}>
        <div onClick={() => setCollapsed(!collapsed)} style={{height:"100%", display:"flex", alignItems:"center", paddingLeft:20, cursor:"pointer"}}>
            <FaBars color='#ffffff' />
        </div>
    </div>
  )
}

export default Header