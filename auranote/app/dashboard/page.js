'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { getAllNotes, getStats, deleteNote as dbDeleteNote, toggleFavorite as dbToggleFavorite, searchNotes } from '@/lib/db';
import { useAuth } from '@/lib/auth-context';
import { getAllNotesFromCloud, deleteNoteFromCloud, toggleFavoriteInCloud, getCloudStats } from '@/lib/firestore';

const navItems = [
  { id: 'inicio', icon: '🏠', label: 'Inicio' },
  { id: 'apuntes', icon: '📝', label: 'Mis Apuntes' },
  { id: 'materias', icon: '📁', label: 'Materias' },
  { id: 'favoritos', icon: '⭐', label: 'Favoritos' },
  { id: 'herramientas', icon: '🧠', label: 'Herramientas' },
  { id: 'compartidos', icon: '👥', label: 'Compartidos' },
  { id: 'config', icon: '⚙️', label: 'Configuración' },
];

const quickActions = [
  { id: 'foto', icon: '📸', title: 'Subir Foto', desc: 'Captura la pizarra', gradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)' },
  { id: 'audio', icon: '🎤', title: 'Grabar Audio', desc: 'Graba tu clase', gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)' },
  { id: 'tema', icon: '📝', title: 'Escribir Tema', desc: 'Genera desde un tema', gradient: 'linear-gradient(135deg, #06b6d4, #22d3ee)' },
  { id: 'video', icon: '🎬', title: 'Subir Video', desc: 'Analiza un video', gradient: 'linear-gradient(135deg, #ec4899, #f472b6)' },
];

const typeIcons = { topic: '📝', foto: '📸', audio: '🎤', video: '🎬' };

const subjectColors = {
  'General': '#7c3aed', 'Matemáticas': '#3b82f6', 'Ing. de Software': '#06b6d4',
  'Física': '#f97316', 'Química': '#22c55e', 'Historia': '#eab308',
  'Biología': '#10b981', 'Medicina': '#ef4444', 'Derecho': '#f59e0b',
  'Administración': '#8b5cf6', 'Economía': '#14b8a6', 'Literatura': '#ec4899',
  'Psicología': '#a855f7', 'Ingeniería': '#6366f1',
};

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'Hace un momento';
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} horas`;
  if (diff < 172800) return 'Ayer';
  return `Hace ${Math.floor(diff / 86400)} días`;
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('inicio');
  const [theme, setTheme] = useState('dark');
  const [notes, setNotes] = useState([]);
  const [stats, setStats] = useState({ total: 0, subjects: 0, thisWeek: 0, favorites: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('auranote-theme');
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [localNotes, localStats] = await Promise.all([getAllNotes(), getStats()]);
      let allNotes = [];
      let mergedStats = { ...localStats };

      if (user) {
        const cloudNotes = await getAllNotesFromCloud(user.uid);
        const cloudStats = await getCloudStats(user.uid);

        const noteMap = new Map();
        localNotes.forEach(n => noteMap.set(n.id, { ...n, storage: 'local' }));
        cloudNotes.forEach(n => noteMap.set(n.id, { ...n, storage: 'nube' }));
        allNotes = Array.from(noteMap.values());

        allNotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        mergedStats.total = allNotes.length;
        mergedStats.favorites = allNotes.filter(n => n.isFavorite).length;
        mergedStats.subjects = new Set(allNotes.map(n => n.subject)).size;
        mergedStats.thisWeek = localStats.thisWeek + (cloudStats?.thisWeek || 0);
      } else {
        allNotes = localNotes.map(n => ({ ...n, storage: 'local' }));
      }

      setNotes(allNotes);
      setStats(mergedStats);
    } catch (err) {
      console.error('Error loading notes:', err);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('auranote-theme', newTheme);
  };

  const handleToggleFavorite = async (note) => {
    if (note.storage === 'nube') {
      await toggleFavoriteInCloud(note.id);
    } else {
      await dbToggleFavorite(note.id);
    }
    loadData();
  };

  const handleDelete = async (note) => {
    if (note.storage === 'nube') {
      await deleteNoteFromCloud(note.id);
    } else {
      await dbDeleteNote(note.id);
    }
    setDeleteConfirm(null);
    loadData();
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      const filtered = notes.filter(n => 
        n.title?.toLowerCase().includes(lowerQuery) || 
        n.content?.toLowerCase().includes(lowerQuery) ||
        n.subject?.toLowerCase().includes(lowerQuery)
      );
      setNotes(filtered);
    } else {
      loadData();
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const getPreview = (content) => {
    if (!content) return '';
    const noHeaders = content.replace(/^#{1,6}\s+.+$/gm, '').replace(/\*\*/g, '').replace(/\*/g, '').trim();
    return noHeaders.substring(0, 120) + (noHeaders.length > 120 ? '...' : '');
  };

  const displayedStats = [
    { label: 'Total Apuntes', value: stats.total.toString(), icon: '📚' },
    { label: 'Materias', value: stats.subjects.toString(), icon: '📁' },
    { label: 'Esta Semana', value: stats.thisWeek.toString(), icon: '📈' },
    { label: 'Favoritos', value: stats.favorites.toString(), icon: '⭐' },
  ];

  const filteredNotes = notes.filter(note => {
    if (activeNav === 'favoritos') return note.isFavorite;
    return true;
  });

  return (
    <div className={styles.dashboard}>
      {sidebarMobileOpen && (
        <div className={styles.backdrop} onClick={() => setSidebarMobileOpen(false)} />
      )}

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarExpanded : styles.sidebarCollapsed} ${sidebarMobileOpen ? styles.sidebarMobileOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.sidebarLogo}>
            <span className={styles.sidebarLogoIcon}>✦</span>
            {sidebarOpen && <span className="gradient-text">AuraNote</span>}
          </Link>
          <button className={styles.collapseBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '«' : '»'}
          </button>
        </div>

        <nav className={styles.sidebarNav}>
          {navItems.map(item => (
            <button key={item.id} className={`${styles.navItem} ${activeNav === item.id ? styles.navItemActive : ''}`} onClick={() => { setActiveNav(item.id); setSidebarMobileOpen(false); }} title={item.label}>
              <span className={styles.navIcon}>{item.icon}</span>
              {sidebarOpen && <span className={styles.navLabel}>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userArea}>
            <div className={styles.avatar}>{user?.displayName?.[0]?.toUpperCase() || 'E'}</div>
            {sidebarOpen && (
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user?.displayName || 'Estudiante'}</span>
                <span className={styles.userEmail}>{user?.email || 'estudiante@uni.edu'}</span>
              </div>
            )}
            {user && sidebarOpen && (
              <button className={styles.iconBtn} onClick={logout} title="Cerrar sesión" style={{marginLeft: 'auto'}}>
                🚪
              </button>
            )}
          </div>
        </div>
      </aside>

      <main className={`${styles.mainContent} ${sidebarOpen ? styles.mainWithSidebar : styles.mainWithCollapsed}`}>
        <header className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <button className={styles.menuBtn} onClick={() => setSidebarMobileOpen(true)}>☰</button>
            <h2 className={styles.greeting}>{getGreeting()}, {user?.displayName?.split(' ')[0] || 'Estudiante'} 👋</h2>
          </div>
          <div className={styles.topBarRight}>
            <div className={styles.searchWrapper}>
              <span className={styles.searchIcon}>🔍</span>
              <input 
                type="text" 
                placeholder="Buscar apuntes..." 
                className={styles.searchInput}
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <button className={styles.iconBtn} title="Notificaciones">🔔</button>
            <button className={styles.iconBtn} onClick={toggleTheme} title="Cambiar tema">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        <section className={styles.statsRow}>
          {displayedStats.map(stat => (
            <div key={stat.label} className={styles.statCard}>
              <span className={styles.statIcon}>{stat.icon}</span>
              <div>
                <div className={styles.statValue}>{stat.value}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            </div>
          ))}
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Crear Nuevo Apunte</h3>
          <div className={styles.actionsGrid}>
            {quickActions.map(action => (
              <Link 
                key={action.id} 
                href={`/dashboard/crear?modo=${action.id}`} 
                className={styles.actionCard} 
                style={{ background: action.gradient }}
              >
                <span className={styles.actionIcon}>{action.icon}</span>
                <span className={styles.actionTitle}>{action.title}</span>
                <span className={styles.actionDesc}>{action.desc}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>
              {filteredNotes.length > 0 ? 'Apuntes Recientes' : 'Tus Apuntes'}
            </h3>
            {filteredNotes.length > 0 && (
              <span className={styles.noteCount}>{filteredNotes.length} apunte{filteredNotes.length !== 1 ? 's' : ''}</span>
            )}
          </div>
          
          {filteredNotes.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>📚</span>
              <h4 className={styles.emptyTitle}>No tienes apuntes todavía</h4>
              <p className={styles.emptyText}>Crea tu primer apunte usando una de las opciones de arriba</p>
              <Link href="/dashboard/crear?modo=tema" className={styles.emptyBtn}>
                ✨ Crear mi primer apunte
              </Link>
            </div>
          ) : (
            <div className={styles.notesGrid}>
              {filteredNotes.map(note => (
                <div key={note.id} className={styles.noteCard}>
                  <div className={styles.noteTop}>
                    <span className={styles.noteSubject} style={{ background: `${subjectColors[note.subject] || '#7c3aed'}20`, color: subjectColors[note.subject] || '#7c3aed' }}>
                      {note.subject}
                    </span>
                    <div className={styles.noteActions}>
                      <span className={styles.noteType} title={note.storage === 'nube' ? 'Guardado en la nube' : 'Guardado localmente'}>
                        {note.storage === 'nube' ? '☁️' : '💾'}
                      </span>
                      <span className={styles.noteType} title={note.type}>{typeIcons[note.type] || '📝'}</span>
                      <button className={styles.favBtn} onClick={() => handleToggleFavorite(note)}>
                        {note.isFavorite ? '★' : '☆'}
                      </button>
                      <button className={styles.deleteBtn} onClick={() => setDeleteConfirm(note.id)} title="Eliminar">
                        🗑️
                      </button>
                    </div>
                  </div>
                  <Link href={`/dashboard/apuntes/${note.id}`} className={styles.noteLink}>
                    <h4 className={styles.noteTitle}>{note.title}</h4>
                    <p className={styles.notePreview}>{getPreview(note.content)}</p>
                  </Link>
                  <span className={styles.noteDate}>{timeAgo(note.createdAt)}</span>
                  
                  {deleteConfirm === note.id && (
                    <div className={styles.deleteConfirm}>
                      <p>¿Eliminar este apunte?</p>
                      <div className={styles.confirmBtns}>
                        <button className={styles.confirmYes} onClick={() => handleDelete(note)}>Sí, eliminar</button>
                        <button className={styles.confirmNo} onClick={() => setDeleteConfirm(null)}>Cancelar</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
