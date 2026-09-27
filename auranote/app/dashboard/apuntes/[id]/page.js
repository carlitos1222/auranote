'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { getNoteById, deleteNote, toggleFavorite, updateNote } from '@/lib/db';
import { useAuth } from '@/lib/auth-context';
import { getAllNotesFromCloud, deleteNoteFromCloud, toggleFavoriteInCloud, updateNoteInCloud } from '@/lib/firestore';

const typeLabels = { topic: 'Tema', foto: 'Foto', audio: 'Audio', video: 'Video' };
const typeIcons = { topic: '📝', foto: '📸', audio: '🎤', video: '🎬' };

export default function NoteViewPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadNote();
  }, [id, user]);

  const loadNote = async () => {
    try {
      let data = await getNoteById(id);
      if (data) {
        data.storage = 'local';
      } else if (user) {
        const cloudNotes = await getAllNotesFromCloud(user.uid);
        const cloudNote = cloudNotes.find(n => n.id === id);
        if (cloudNote) {
          data = cloudNote;
          data.storage = 'nube';
        }
      }

      if (data) {
        setNote(data);
        setEditContent(data.content);
        setEditTitle(data.title);
      } else {
        setNote(null);
      }
    } catch (err) {
      console.error('Error loading note:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFav = async () => {
    if (note.storage === 'nube') {
      await toggleFavoriteInCloud(id);
    } else {
      await toggleFavorite(id);
    }
    loadNote();
  };

  const handleDelete = async () => {
    if (note.storage === 'nube') {
      await deleteNoteFromCloud(id);
    } else {
      await deleteNote(id);
    }
    router.push('/dashboard');
  };

  const handleSaveEdit = async () => {
    if (note.storage === 'nube') {
      await updateNoteInCloud(id, { title: editTitle, content: editContent });
    } else {
      await updateNote(id, { title: editTitle, content: editContent });
    }
    setIsEditing(false);
    loadNote();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(note.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([note.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s]/g, '')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderMarkdown = (md) => {
    if (!md) return '';
    let html = md
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br/>');
    html = html.replace(/(<li>.*?<\/li>(<br\/>)?)+/g, (match) => {
      return '<ul>' + match.replace(/<br\/>/g, '') + '</ul>';
    });
    return '<p>' + html + '</p>';
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Cargando apunte...</p>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>
          <span className={styles.notFoundIcon}>📭</span>
          <h2>Apunte no encontrado</h2>
          <p>Este apunte no existe o fue eliminado</p>
          <Link href="/dashboard" className={styles.backLink}>← Volver al Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/dashboard" className={styles.backBtn}>← Volver al Dashboard</Link>
        <div className={styles.headerMain}>
          <div className={styles.headerLeft}>
            <div className={styles.noteMeta}>
              <span className={styles.noteType} title={note.storage === 'nube' ? 'En la nube' : 'Local'}>{note.storage === 'nube' ? '☁️' : '💾'} {typeIcons[note.type]} {typeLabels[note.type]}</span>
              <span className={styles.noteSubject}>{note.subject}</span>
              <span className={styles.noteDate}>{formatDate(note.createdAt)}</span>
            </div>
            {isEditing ? (
              <input
                className={styles.editTitleInput}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Título del apunte"
              />
            ) : (
              <h1 className={styles.noteTitle}>{note.title}</h1>
            )}
          </div>
          <div className={styles.headerActions}>
            <button className={`${styles.actionBtn} ${note.isFavorite ? styles.favActive : ''}`} onClick={handleToggleFav}>
              {note.isFavorite ? '★' : '☆'} {note.isFavorite ? 'Favorito' : 'Favorito'}
            </button>
            <button className={styles.actionBtn} onClick={handleCopy}>
              {copied ? '✅ Copiado' : '📋 Copiar'}
            </button>
            <button className={styles.actionBtn} onClick={handleDownload}>
              ⬇️ Descargar
            </button>
            {isEditing ? (
              <>
                <button className={styles.saveEditBtn} onClick={handleSaveEdit}>💾 Guardar</button>
                <button className={styles.cancelEditBtn} onClick={() => { setIsEditing(false); setEditContent(note.content); setEditTitle(note.title); }}>Cancelar</button>
              </>
            ) : (
              <button className={styles.actionBtn} onClick={() => setIsEditing(true)}>✏️ Editar</button>
            )}
            <button className={styles.deleteActionBtn} onClick={() => setShowDelete(true)}>🗑️ Eliminar</button>
          </div>
        </div>
      </header>

      <div className={styles.contentArea}>
        {isEditing ? (
          <textarea
            className={styles.editTextarea}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            placeholder="Escribe el contenido en Markdown..."
          />
        ) : (
          <div className={styles.noteContent} dangerouslySetInnerHTML={{ __html: renderMarkdown(note.content) }} />
        )}
      </div>

      {showDelete && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>¿Eliminar este apunte?</h3>
            <p>Esta acción no se puede deshacer</p>
            <div className={styles.modalBtns}>
              <button className={styles.modalDeleteBtn} onClick={handleDelete}>Sí, eliminar</button>
              <button className={styles.modalCancelBtn} onClick={() => setShowDelete(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
