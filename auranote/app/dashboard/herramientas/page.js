'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { getAllNotes } from '@/lib/db';

const tools = [
  { id: 'flashcards', icon: '🃏', title: 'Flashcards', desc: 'Tarjetas de memorización automáticas', color: '#7c3aed' },
  { id: 'quiz', icon: '🧠', title: 'Quiz', desc: 'Preguntas de opción múltiple', color: '#3b82f6' },
  { id: 'summary', icon: '📋', title: 'Resumen', desc: 'Resumen ejecutivo para repasar', color: '#06b6d4' },
];

export default function HerramientasPage() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [activeTool, setActiveTool] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Tool results
  const [flashcards, setFlashcards] = useState([]);
  const [flippedCards, setFlippedCards] = useState({});
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  
  const [summary, setSummary] = useState('');

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const allNotes = await getAllNotes();
      setNotes(allNotes);
    } catch (err) {
      console.error('Error loading notes:', err);
    }
  };

  const handleGenerate = async (toolId) => {
    if (!selectedNote) { setError('Selecciona un apunte primero'); return; }
    setError('');
    setIsLoading(true);
    setActiveTool(toolId);
    setFlashcards([]); setQuizQuestions([]); setSummary('');
    setFlippedCards({}); setUserAnswers({}); setShowResults(false); setCurrentCardIndex(0);

    try {
      const res = await fetch(`/api/ai/${toolId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: selectedNote.content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (toolId === 'flashcards') setFlashcards(data.flashcards);
      else if (toolId === 'quiz') setQuizQuestions(data.questions);
      else if (toolId === 'summary') setSummary(data.summary);
    } catch (err) {
      setError(err.message || 'Error al generar. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFlip = (idx) => setFlippedCards(prev => ({ ...prev, [idx]: !prev[idx] }));
  const selectAnswer = (qIdx, aIdx) => { if (!showResults) setUserAnswers(prev => ({ ...prev, [qIdx]: aIdx })); };
  const getScore = () => quizQuestions.reduce((s, q, i) => s + (userAnswers[i] === q.correcta ? 1 : 0), 0);

  const renderMarkdown = (md) => {
    if (!md) return '';
    return md
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/dashboard" className={styles.backBtn}>← Volver al Dashboard</Link>
        <h1 className={styles.title}>🧠 Herramientas de Estudio</h1>
        <p className={styles.subtitle}>Selecciona un apunte y genera herramientas de estudio con IA</p>
      </header>

      {/* Note Selector */}
      <div className={styles.noteSelector}>
        <label className={styles.selectorLabel}>Selecciona un apunte:</label>
        {notes.length === 0 ? (
          <p className={styles.noNotes}>No tienes apuntes guardados. <Link href="/dashboard/crear" className={styles.createLink}>Crea uno primero</Link></p>
        ) : (
          <div className={styles.notesList}>
            {notes.map(note => (
              <button
                key={note.id}
                className={`${styles.noteOption} ${selectedNote?.id === note.id ? styles.noteOptionActive : ''}`}
                onClick={() => setSelectedNote(note)}
              >
                <span className={styles.noteOptionTitle}>{note.title}</span>
                <span className={styles.noteOptionMeta}>{note.subject}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tools Grid */}
      <div className={styles.toolsGrid}>
        {tools.map(tool => (
          <button
            key={tool.id}
            className={styles.toolCard}
            onClick={() => handleGenerate(tool.id)}
            disabled={isLoading || !selectedNote}
            style={{ '--tool-color': tool.color }}
          >
            <span className={styles.toolIcon}>{tool.icon}</span>
            <span className={styles.toolTitle}>{tool.title}</span>
            <span className={styles.toolDesc}>{tool.desc}</span>
          </button>
        ))}
      </div>

      {error && <div className={styles.error}>⚠️ {error}</div>}

      {isLoading && (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Generando {activeTool}...</p>
        </div>
      )}

      {/* FLASHCARDS */}
      {flashcards.length > 0 && (
        <div className={styles.resultSection}>
          <h2 className={styles.resultTitle}>🃏 Flashcards ({currentCardIndex + 1}/{flashcards.length})</h2>
          <div className={styles.flashcardContainer}>
            <div className={`${styles.flashcard} ${flippedCards[currentCardIndex] ? styles.flipped : ''}`} onClick={() => toggleFlip(currentCardIndex)}>
              <div className={styles.flashcardFront}>
                <span className={styles.flashcardLabel}>Pregunta</span>
                <p>{flashcards[currentCardIndex]?.pregunta}</p>
                <span className={styles.flipHint}>Toca para ver respuesta</span>
              </div>
              <div className={styles.flashcardBack}>
                <span className={styles.flashcardLabel}>Respuesta</span>
                <p>{flashcards[currentCardIndex]?.respuesta}</p>
              </div>
            </div>
            <div className={styles.cardNav}>
              <button className={styles.navBtn} onClick={() => setCurrentCardIndex(Math.max(0, currentCardIndex - 1))} disabled={currentCardIndex === 0}>← Anterior</button>
              <span className={styles.cardCounter}>{currentCardIndex + 1} / {flashcards.length}</span>
              <button className={styles.navBtn} onClick={() => setCurrentCardIndex(Math.min(flashcards.length - 1, currentCardIndex + 1))} disabled={currentCardIndex === flashcards.length - 1}>Siguiente →</button>
            </div>
          </div>
        </div>
      )}

      {/* QUIZ */}
      {quizQuestions.length > 0 && (
        <div className={styles.resultSection}>
          <h2 className={styles.resultTitle}>🧠 Quiz</h2>
          {showResults && (
            <div className={styles.scoreCard}>
              <span className={styles.scoreEmoji}>{getScore() >= quizQuestions.length * 0.7 ? '🎉' : '💪'}</span>
              <span className={styles.scoreText}>Puntuación: {getScore()}/{quizQuestions.length}</span>
            </div>
          )}
          <div className={styles.quizList}>
            {quizQuestions.map((q, qIdx) => (
              <div key={qIdx} className={styles.quizQuestion}>
                <p className={styles.questionText}>{qIdx + 1}. {q.pregunta}</p>
                <div className={styles.options}>
                  {q.opciones.map((opt, oIdx) => {
                    let optClass = styles.option;
                    if (showResults) {
                      if (oIdx === q.correcta) optClass += ` ${styles.optionCorrect}`;
                      else if (userAnswers[qIdx] === oIdx) optClass += ` ${styles.optionWrong}`;
                    } else if (userAnswers[qIdx] === oIdx) {
                      optClass += ` ${styles.optionSelected}`;
                    }
                    return (
                      <button key={oIdx} className={optClass} onClick={() => selectAnswer(qIdx, oIdx)}>
                        <span className={styles.optionLetter}>{String.fromCharCode(65 + oIdx)}</span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {showResults && userAnswers[qIdx] !== undefined && (
                  <p className={styles.explanation}>💡 {q.explicacion}</p>
                )}
              </div>
            ))}
          </div>
          {!showResults && Object.keys(userAnswers).length > 0 && (
            <button className={styles.checkBtn} onClick={() => setShowResults(true)}>✅ Verificar Respuestas</button>
          )}
        </div>
      )}

      {/* SUMMARY */}
      {summary && (
        <div className={styles.resultSection}>
          <h2 className={styles.resultTitle}>📋 Resumen Ejecutivo</h2>
          <div className={styles.summaryContent} dangerouslySetInnerHTML={{ __html: renderMarkdown(summary) }} />
        </div>
      )}
    </div>
  );
}
