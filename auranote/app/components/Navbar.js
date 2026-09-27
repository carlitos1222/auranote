'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.navContainer}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>✦</span>
          <span className="gradient-text">AuraNote</span>
        </Link>
        
        <div className={styles.navLinks}>
          <a href="#caracteristicas" className={styles.navLink}>Características</a>
          <a href="#como-funciona" className={styles.navLink}>Cómo funciona</a>
        </div>
        
        <div className={styles.navActions}>
          <Link href="/login" className={styles.loginBtn}>Iniciar Sesión</Link>
          <Link href="/registro" className={styles.registerBtn}>Registrarse</Link>
        </div>
        
        <button 
          className={styles.hamburger} 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Menu"
        >
          <span className={`${styles.hamburgerLine} ${isMobileMenuOpen ? styles.open : ''}`}></span>
          <span className={`${styles.hamburgerLine} ${isMobileMenuOpen ? styles.open : ''}`}></span>
          <span className={`${styles.hamburgerLine} ${isMobileMenuOpen ? styles.open : ''}`}></span>
        </button>
      </div>
      
      {isMobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <a href="#caracteristicas" className={styles.mobileLink} onClick={() => setIsMobileMenuOpen(false)}>Características</a>
          <a href="#como-funciona" className={styles.mobileLink} onClick={() => setIsMobileMenuOpen(false)}>Cómo funciona</a>
          <Link href="/login" className={styles.mobileLink}>Iniciar Sesión</Link>
          <Link href="/registro" className={styles.mobileCta}>Registrarse</Link>
        </div>
      )}
    </nav>
  );
}
