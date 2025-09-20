import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from './AdminHeader.module.css';

// Taller banner-style admin header with centered logo and nav
const AdminHeader = () => {
  const navigate = useNavigate();
  return (
    <header className={styles.header}>
      <div className={styles.bannerWrapper} onClick={() => navigate('/admin-0')} role="button" title="Go to Admin Overview">
        <img src="/sih-logo.png" alt="SIH banner" className={styles.bannerImage} />
      </div>
      <nav className={styles.nav} aria-label="Admin navigation">
        <NavLink to="/admin-0" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>Overview</NavLink>
        <NavLink to="/admin-1" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>Projects</NavLink>
        <NavLink to="/admin-2" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>Reports</NavLink>
      </nav>
    </header>
  );
};

export default AdminHeader;
