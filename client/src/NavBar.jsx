import React, { useState } from 'react';
import './NavBar.css';
import userIcon from './assets/userIcon.png';

function NavBar() {
    const [dropdownVisible, setDropdownVisible] = useState(false);

    const toggleDropdown = () => {
        setDropdownVisible(!dropdownVisible);
    };

    return (
        <header className="navbar_header">
            <div className="navbar_logo">BugFixer</div>
            <nav className="navbar_nav">
                <a href="#solutions">Solutions</a>
                <a href="#community">Community</a>
                <a href="#resources">Resources</a>
                <a href="#contact">Contact</a>
            </nav>
            <div className="navbar_profile-icon" onClick={toggleDropdown}>
                <img className="hero-image" src={userIcon} alt="Profile Icon" />
                {dropdownVisible && (
                    <div className="navbar_dropdown">
                        <button className="navbar_dropdown-button">Login</button>
                        <button className="navbar_dropdown-button">Register</button>
                    </div>
                )}
            </div>
        </header>
    );
}

export default NavBar