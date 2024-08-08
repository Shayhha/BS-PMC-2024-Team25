import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './NavBar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCog, faSignOutAlt, faBell } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

function NavBar() {
    const [dropdownVisible, setDropdownVisible] = useState({
        login: false,
        settings: false,
        logout: false,
        notifications: false
    });
    const [showEditUser, setShowEditUser] = useState(false);
    const [userName, setUserName] = useState('');
    const [userType, setUserType] = useState(''); 
    const [userId, setUserId] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loadingUser, setLoadingUser] = useState(true);
    const [loadingNotifications, setLoadingNotifications] = useState(false);

    const profileRef = useRef(null);
    const settingsRef = useRef(null);
    const logoutRef = useRef(null);
    const location = useLocation();

    const toggleDropdown = (type) => {
        setDropdownVisible(prevState => ({
            ...prevState,
            [type]: !prevState[type],
        }));
    };

    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:8090/homepage/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                setIsLoggedIn(false);
                setUserName('');
                setUserType('');
                setUserId('');
                setDropdownVisible({ login: false, settings: false, logout: false, notifications: false });
                
                // Manipulate browser history and redirect
                for (let i = 0; i < history.length; i++) {
                    history.pushState(null, null, '/login');
                }
                window.location.href = '/login';
                
            } else {
                console.error('Failed to logout:', response.statusText);
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const fetchUserInfo = async () => {
        setLoadingUser(true);
        try {
            const response = await fetch('http://localhost:8090/userSettings/getUser', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.status === 204) {
                setShowEditUser(false);
                setIsLoggedIn(false);
            } else if (response.ok) {
                const data = await response.json();
                setUserName(data.userName);
                setUserType(data.userType); 
                setUserId(data.userId);
                setShowEditUser(true);
                setIsLoggedIn(true);
            } else {
                console.error('Failed to fetch user info');
            }
        } catch (error) {
            console.error('Error fetching user info:', error);
        } finally {
            setLoadingUser(false);
        }
    };

    const fetchNotifications = async () => {
        if (!userId) return;
        setLoadingNotifications(true);
        try {
            const response = await axios.post('http://localhost:8090/notifications/getNotifications', { userId });
            const notifications = response.data;
            setNotifications(notifications);
            setUnreadCount(notifications.filter(notification => !notification.read).length);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoadingNotifications(false);
        }
    };

    const markNotificationAsRead = async (notificationId,read) => {
        try {
            await axios.post('http://localhost:8090/notifications/markNotificationsAsRead', { notificationId:notificationId ,read:read});
            setNotifications(prevNotifications =>
                prevNotifications.map(notification =>
                    notification.id === notificationId ? { ...notification, read: true } : notification
                )
            );
            setUnreadCount(prevCount => prevCount - 1);
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    useEffect(() => {
        fetchUserInfo();
        if (isLoggedIn) {
            fetchNotifications();
        }
    }, [isLoggedIn, userId]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                profileRef.current && !profileRef.current.contains(event.target) &&
                settingsRef.current && !settingsRef.current.contains(event.target) &&
                logoutRef.current && !logoutRef.current.contains(event.target)
            ) {
                setDropdownVisible({ login: false, settings: false, logout: false, notifications: false });
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="navbar_header">
            <div className="navbar_logo">
                {isLoggedIn && userType === "Coder" && (
                    <Link to="/coder" className="navbar_logo_text">
                        BugFixer
                    </Link>
                )}
                {isLoggedIn && userType === "Tester" && (
                    <Link to="/tester" className="navbar_logo_text">
                        BugFixer
                    </Link>
                )}
                {isLoggedIn && userType === "Manager" && (
                    <Link to="/admin" className="navbar_logo_text">
                        BugFixer
                    </Link>
                )}
                {!isLoggedIn && (
                    <Link to="/" className="navbar_logo_text">
                        BugFixer
                    </Link>
                )}
            </div>
            {isLoggedIn && location.pathname !== '/login' && location.pathname !== '/register' && (
                <span className="navbar_welcome">Welcome, {userName}</span>
            )}

            <nav className="navbar_nav">
                <a href="#solutions">Solutions</a>
                <a href="#community">Community</a>
                <a href="#resources">Resources</a>
                <a href="#contact">Contact</a>
            </nav>

            <div className="navbar_profile">
                <div className="navbar_profile-icons">
                    {(location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/') && (
                        <div
                            className="navbar_profile-icon"
                            onClick={() => toggleDropdown('login')}
                            ref={profileRef}
                            aria-haspopup="true"
                        >
                            <FontAwesomeIcon icon={faUser} className="hero-image" />
                            {dropdownVisible.login && (
                                <div className="navbar_dropdown" role="menu">
                                    <Link to="/login" className="navbar_dropdown-button" role="menuitem">
                                        Login
                                    </Link>
                                    <Link to="/register" className="navbar_dropdown-button" role="menuitem">
                                        Register
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                    {isLoggedIn && location.pathname !== '/login' && location.pathname !== '/register' && location.pathname !== '/' && (
                        <>
                            <div
                                className="navbar_profile-icon"
                                onClick={() => toggleDropdown('notifications')}
                                aria-haspopup="true"
                            >
                                <FontAwesomeIcon
                                    icon={faBell}
                                    className="notification-icon"
                                />
                                {unreadCount > 0 && (
                                    <span className="notification-badge">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            {dropdownVisible.notifications && (
                                <div className="notification-dropdown show">
                                    {loadingNotifications ? (
                                        <div className="notification-item">Loading...</div>
                                    ) : notifications.length > 0 ? (
                                        notifications.map((notification) => (
                                            <button
                                                key={notification.id}
                                                className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                                                onClick={() => !notification.read && markNotificationAsRead(notification.id,notification.read)}
                                            >
                                                <strong>Message:</strong> {notification.message}
                                                <br />
                                                <strong>Date:</strong> {notification.creationDate}
                                                <br />
                                                <strong>Time:</strong> {notification.creationHour}
                                                <br />
                                            </button>
                                        ))
                                    ) : (
                                        <div className="notification-item">No notifications</div>
                                    )}
                                    <button onClick={() => setDropdownVisible(prev => ({ ...prev, notifications: false }))} className="notification-close">Close</button>
                                </div>
                            )}
                            <div
                                className="navbar_profile-icon"
                                onClick={() => toggleDropdown('settings')}
                                ref={settingsRef}
                                aria-haspopup="true"
                            >
                                <FontAwesomeIcon icon={faCog} className="settings-icon" />
                                {dropdownVisible.settings && (
                                    <div className="navbar_dropdown" role="menu">
                                        {showEditUser && (
                                            <Link to="/edituser" className="navbar_dropdown-button" role="menuitem">
                                                Edit User
                                            </Link>
                                        )}
                                        {userType === 'Manager' && (
                                            <Link to="/removeUser" className="navbar_dropdown-button" role="menuitem">
                                                Remove User
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div
                                className="navbar_profile-icon"
                                onClick={() => toggleDropdown('logout')}
                                ref={logoutRef}
                                aria-haspopup="true"
                            >
                                <FontAwesomeIcon
                                    icon={faSignOutAlt}
                                    className="logout-icon"
                                />
                                {dropdownVisible.logout && (
                                    <div className="navbar_dropdown" role="menu">
                                        <Link onClick={handleLogout} to="/login" className="navbar_dropdown-button" role="menuitem" >
                                            Logout
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

export default NavBar;
