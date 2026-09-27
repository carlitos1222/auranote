'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { saveNote } from '@/lib/db';
import { useAuth } from '@/lib/auth-context';
import { saveNoteToCloud } from '@/lib/firestore';

const modes = [
  { id: 'foto', icon: '📸', title: 'Foto', desc: 'Sube una foto de la pizarra', accept: 'image/*', gradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)' },
  { id: 'audio', icon: '🎤', title: 'Audio', desc: 'Sube una grabación de clase', accept: 'audio/*', gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)' },
  { id: 'tema', icon: '📝', title: 'Tema', desc: 'Escribe el tema a desarrollar', accept: null, gradient: 'linear-gradient(135deg, #06b6d4, #22d3ee)' },
  { id: 'video', icon: '🎬', title: 'Video', desc: 'Sube un video educativo', accept: 'video/*', gradient: 'linear-gradient(135deg, #ec4899, #f472b6)' },
];

export default function CrearApuntePage() {
  const { user } = useAuth();
  const [storageType, setStorageType] = useState('local');
  const [activeMode, setActiveMode] = useState('tema');
  const [topic, setTopic] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteSubject, setNoteSubject] = useState('General');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const modo = params.get('modo');
    if (modo && modes.some(m => m.id === modo)) {
      setActiveMode(modo);
    }
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      if (activeMode === 'foto' && selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setFilePreview(e.target.result);
        reader.readAsDataURL(selectedFile);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setError('');
      if (activeMode === 'foto' && droppedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => setFilePreview(ev.target.result);
        reader.readAsDataURL(droppedFile);
      }
    }
  }, [activeMode]);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const clearFile = () => {
    setFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleModeChange = (modeId) => {
    setActiveMode(modeId);
    setFile(null);
    setFilePreview(null);
    setError('');
    setNotes('');
    setTopic('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    if (!notes) return;
    const titleFromContent = notes.match(/^#\s+(.+)$/m)?.[1] || topic || 'Apunte sin título';
    try {
      const noteData = {
        title: noteTitle || titleFromContent,
        content: notes,
        type: activeMode === 'foto' ? 'foto' : activeMode,
        subject: noteSubject,
        source: activeMode === 'tema' ? topic : file?.name || '',
      };

      if (storageType === 'nube' && user) {
        await saveNoteToCloud(user.uid, noteData);
      } else {
        await saveNote(noteData);
      }
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError('Error al guardar el apunte');
    }
  };

  const handleGenerate = async () => {
    setError('');
    setNotes('');
    setIsLoading(true);

    try {
      let response;

      if (activeMode === 'tema') {
        if (!topic.trim()) {
          setError('Por favor escribe un tema');
          setIsLoading(false);
          return;
        }
        response = await fetch('/api/ai/topic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: topic.trim() }),
        });
      } else {
        if (!file) {
          setError(`Por favor selecciona un archivo de ${activeMode}`);
          setIsLoading(false);
          return;
        }
        const formData = new FormData();
        const fieldName = activeMode === 'foto' ? 'image' : activeMode;
        formData.append(fieldName, file);
        
        response = await fetch(`/api/ai/${activeMode}`, {
          method: 'POST',
          body: formData,
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al generar apuntes');
      }

      setNotes(data.notes);
      setNoteTitle(data.notes.match(/^#\s+(.+)$/m)?.[1] || topic || '');
    } catch (err) {
      setError(err.message || 'Error inesperado. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyNotes = () => {
    navigator.clipboard.writeText(notes);
  };

  const downloadNotes = () => {
    const blob = new Blob([notes], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `apuntes-${activeMode}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentMode = modes.find(m => m.id === activeMode);

  // Simple markdown to HTML renderer
  const renderMarkdown = (md) => {
    if (!md) return '';
    let html = md
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');
    // Wrap consecutive <li> in <ul>
    html = html.replace(/(<li>.*?<\/li>(<br\/>)?)+/g, (match) => {
      return '<ul>' + match.replace(/<br\/>/g, '') + '</ul>';
    });
    return html;
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <Link href="/dashboard" className={styles.backBtn}>
          ← Volver al Dashboard
        </Link>
        <h1 className={styles.pageTitle}>Crear Nuevo Apunte</h1>
        <p className={styles.pageSubtitle}>Selecciona cómo quieres generar tus apuntes</p>
      </header>

      {/* Mode Selector */}
      <div className={styles.modeSelector}>
        {modes.map(mode => (
          <button
            key={mode.id}
            className={`${styles.modeBtn} ${activeMode === mode.id ? styles.modeBtnActive : ''}`}
            onClick={() => handleModeChange(mode.id)}
            style={activeMode === mode.id ? { background: mode.gradient } : {}}
          >
            <span className={styles.modeIcon}>{mode.icon}</span>
            <span className={styles.modeTitle}>{mode.title}</span>
          </button>
        ))}
      </div>

      <div className={styles.contentArea}>
        {/* Input Area */}
        <div className={styles.inputPanel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelIcon}>{currentMode.icon}</span>
            <div>
              <h3 className={styles.panelTitle}>{currentMode.title}</h3>
              <p className={styles.panelDesc}>{currentMode.desc}</p>
            </div>
          </div>

          {activeMode === 'tema' ? (
            <div className={styles.topicInput}>
              <label className={styles.inputLabel}>Tema o título del apunte</label>
              <textarea
                className={styles.textarea}
                placeholder="Ejemplo: Ecuaciones diferenciales de primer orden, Historia de la Revolución Francesa, Anatomía del sistema cardiovascular..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={4}
              />
              <p className={styles.inputHint}>💡 Sé lo más específico posible para obtener mejores apuntes</p>
            </div>
          ) : (
            <div
              className={`${styles.dropZone} ${file ? styles.dropZoneHasFile : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => !file && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={currentMode.accept}
                onChange={handleFileChange}
                className={styles.fileInput}
              />
              {file ? (
                <div className={styles.fileInfo}>
                  {filePreview && activeMode === 'foto' ? (
                    <img src={filePreview} alt="Preview" className={styles.imagePreview} />
                  ) : (
                    <div className={styles.fileIconLarge}>
                      {activeMode === 'audio' ? '🎵' : '🎬'}
                    </div>
                  )}
                  <div className={styles.fileDetails}>
                    <span className={styles.fileName}>{file.name}</span>
                    <span className={styles.fileSize}>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  <button className={styles.removeFile} onClick={(e) => { e.stopPropagation(); clearFile(); }}>
                    ✕ Quitar
                  </button>
                </div>
              ) : (
                <div className={styles.dropContent}>
                  <span className={styles.dropIcon}>{currentMode.icon}</span>
                  <p className={styles.dropText}>Arrastra tu archivo aquí</p>
                  <p className={styles.dropSubtext}>o haz clic para seleccionar</p>
                  <span className={styles.dropAccept}>
                    {activeMode === 'foto' ? 'JPG, PNG, WEBP' : activeMode === 'audio' ? 'MP3, WAV, M4A, OGG' : 'MP4, WEBM, MOV'}
                  </span>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className={styles.errorMsg}>
              ⚠️ {error}
            </div>
          )}

          <button
            className={styles.generateBtn}
            onClick={handleGenerate}
            disabled={isLoading}
            style={{ background: currentMode.gradient }}
          >
            {isLoading ? (
              <>
                <span className={styles.spinner}></span>
                Generando apuntes...
              </>
            ) : (
              <>
                ✨ Generar Apuntes con IA
              </>
            )}
          </button>
        </div>

        {/* Output Area */}
        <div className={styles.outputPanel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelIcon}>📄</span>
            <div>
              <h3 className={styles.panelTitle}>Apuntes Generados</h3>
              <p className={styles.panelDesc}>Resultado procesado por IA</p>
            </div>
            {notes && (
              <div className={styles.outputActions}>
                <div className={styles.storageToggle}>
                  <button 
                    className={`${styles.storageBtn} ${storageType === 'local' ? styles.storageBtnActive : ''}`}
                    onClick={() => setStorageType('local')}
                    type="button"
                  >
                    💾 Local
                  </button>
                  <button 
                    className={`${styles.storageBtn} ${storageType === 'nube' ? styles.storageBtnActive : ''}`}
                    onClick={() => setStorageType('nube')}
                    disabled={!user}
                    title={!user ? 'Inicia sesión para guardar en la nube' : 'Guardar en Firebase'}
                    type="button"
                  >
                    ☁️ Nube
                  </button>
                </div>
                <select 
                  className={styles.subjectSelect} 
                  value={noteSubject} 
                  onChange={(e) => setNoteSubject(e.target.value)}
                >
                  <option value="General">General</option>
                  <option value="Matemáticas">Matemáticas</option>
                  <option value="Ing. de Software">Ing. de Software</option>
                  <option value="Física">Física</option>
                  <option value="Química">Química</option>
                  <option value="Historia">Historia</option>
                  <option value="Biología">Biología</option>
                  <option value="Medicina">Medicina</option>
                  <option value="Derecho">Derecho</option>
                  <option value="Administración">Administración</option>
                  <option value="Economía">Economía</option>
                  <option value="Literatura">Literatura</option>
                  <option value="Psicología">Psicología</option>
                  <option value="Ingeniería">Ingeniería</option>
                </select>
                <button className={styles.actionBtn} onClick={copyNotes} title="Copiar">
                  📋 Copiar
                </button>
                <button className={styles.actionBtn} onClick={downloadNotes} title="Descargar">
                  ⬇️ Descargar
                </button>
                <button className={`${styles.saveBtn} ${saved ? styles.saveBtnSaved : ''}`} onClick={handleSave} title="Guardar">
                  {saved ? '✅ Guardado!' : '💾 Guardar'}
                </button>
              </div>
            )}
          </div>

          <div className={styles.outputContent}>
            {isLoading ? (
              <div className={styles.loadingState}>
                <div className={styles.loadingSpinner}></div>
                <p className={styles.loadingText}>La IA está analizando tu contenido...</p>
                <p className={styles.loadingSubtext}>Esto puede tomar unos segundos</p>
              </div>
            ) : notes ? (
              <div 
                className={styles.notesContent}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(notes) }}
              />
            ) : (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>🤖</span>
                <p className={styles.emptyText}>Los apuntes aparecerán aquí</p>
                <p className={styles.emptySubtext}>Selecciona un modo, sube tu contenido y presiona "Generar Apuntes"</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
