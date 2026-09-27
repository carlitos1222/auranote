'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { useAuth } from '@/lib/auth-context';
import { getAllNotes } from '@/lib/db';

export default function ConfigPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [theme, setTheme] = useState('dark');
  const [stats, setStats] = useState({ total: 0, local: 0 });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('auranote-theme');
    if (saved) setTheme(saved);
    loadStats();
  }, []);

  const loadStats = async () => {
    const notes = await getAllNotes();
    setStats({ total: notes.length, local: notes.filter(n => n.storage === 'local').length });
  };

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('auranote-theme', newTheme);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/dashboard" className={styles.backBtn}>← Volver al Dashboard</Link>
        <h1 className={styles.title}>⚙️ Configuración</h1>
      </header>

      {/* Profile Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>👤 Perfil</h2>
        <div className={styles.profileCard}>
          <div className={styles.profileAvatar}>
            {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'E'}
          </div>
          <div className={styles.profileInfo}>
            <h3 className={styles.profileName}>{user?.displayName || 'Estudiante'}</h3>
            <p className={styles.profileEmail}>{user?.email || 'No has iniciado sesión'}</p>
            <span className={styles.profileBadge}>{user ? '✅ Conectado' : '⚠️ Sin cuenta'}</span>
          </div>
          {!user && (
            <Link href="/login" className={styles.loginBtn}>
              Iniciar Sesión
            </Link>
          )}
        </div>
      </section>

      {/* Theme Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>🎨 Apariencia</h2>
        <div className={styles.themeOptions}>
          <button className={`${styles.themeCard} ${theme === 'dark' ? styles.themeActive : ''}`} onClick={() => changeTheme('dark')}>
            <span className={styles.themeIcon}>🌙</span>
            <span className={styles.themeName}>Oscuro</span>
            <span className={styles.themeDesc}>Tema por defecto</span>
          </button>
          <button className={`${styles.themeCard} ${theme === 'light' ? styles.themeActive : ''}`} onClick={() => changeTheme('light')}>
            <span className={styles.themeIcon}>☀️</span>
            <span className={styles.themeName}>Claro</span>
            <span className={styles.themeDesc}>Para ambientes iluminados</span>
          </button>
        </div>
      </section>

      {/* Storage Stats */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>💾 Almacenamiento</h2>
        <div className={styles.storageCard}>
          <div className={styles.storageStat}>
            <span className={styles.storageValue}>{stats.total}</span>
            <span className={styles.storageLabel}>Apuntes totales</span>
          </div>
          <div className={styles.storageStat}>
            <span className={styles.storageValue}>{stats.local}</span>
            <span className={styles.storageLabel}>Almacenados localmente</span>
          </div>
          <div className={styles.storageStat}>
            <span className={styles.storageValue}>{stats.total - stats.local}</span>
            <span className={styles.storageLabel}>En la nube</span>
          </div>
        </div>
      </section>

      {/* About & Donate */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>❤️ Apoyar AuraNote</h2>
        <div className={styles.donateCard}>
          <div className={styles.donateContent}>
            <h3 className={styles.donateTitle}>¿Te gusta AuraNote?</h3>
            <p className={styles.donateText}>AuraNote es un proyecto gratuito y open source. Si te ha sido útil, considera hacer una pequeña donación para ayudarnos a seguir mejorando. ¡No hay monto mínimo!</p>
            <div className={styles.donateBtns}>
              <a href="https://paypal.me" target="_blank" rel="noopener noreferrer" className={styles.donateBtn}>
                ☕ Invitame un café
              </a>
            </div>
          </div>
          <span className={styles.donateEmoji}>🙏</span>
        </div>
      </section>

      {/* About */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>ℹ️ Acerca de</h2>
        <div className={styles.aboutCard}>
          <p><strong>AuraNote</strong> v1.0.0</p>
          <p>Plataforma inteligente de apuntes universitarios con IA</p>
          <p className={styles.aboutTech}>Next.js · Gemini AI · Firebase · IndexedDB</p>
        </div>
      </section>

      {/* Danger Zone */}
      {user && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitleDanger}>⚠️ Zona de Peligro</h2>
          <button className={styles.logoutBtn} onClick={() => setShowLogoutConfirm(true)}>
            🚪 Cerrar Sesión
          </button>
          {showLogoutConfirm && (
            <div className={styles.logoutConfirm}>
              <p>¿Seguro que quieres cerrar sesión?</p>
              <div className={styles.confirmBtns}>
                <button className={styles.confirmYes} onClick={handleLogout}>Sí, cerrar</button>
                <button className={styles.confirmNo} onClick={() => setShowLogoutConfirm(false)}>Cancelar</button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
