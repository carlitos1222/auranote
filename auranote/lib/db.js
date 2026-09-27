const DB_NAME = 'auranote-db';
const DB_VERSION = 1;
const NOTES_STORE = 'notes';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(NOTES_STORE)) {
        const store = db.createObjectStore(NOTES_STORE, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('subject', 'subject', { unique: false });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('isFavorite', 'isFavorite', { unique: false });
      }
    };
  });
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export async function saveNote(noteData) {
  const db = await openDB();
  const note = {
    id: noteData.id || generateId(),
    title: noteData.title || 'Sin título',
    content: noteData.content || '',
    type: noteData.type || 'topic', // topic, foto, audio, video
    subject: noteData.subject || 'General',
    source: noteData.source || '',
    createdAt: noteData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isFavorite: noteData.isFavorite || false,
    storage: 'local',
  };
  return new Promise((resolve, reject) => {
    const tx = db.transaction(NOTES_STORE, 'readwrite');
    const store = tx.objectStore(NOTES_STORE);
    const request = store.put(note);
    request.onsuccess = () => resolve(note);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllNotes() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(NOTES_STORE, 'readonly');
    const store = tx.objectStore(NOTES_STORE);
    const request = store.getAll();
    request.onsuccess = () => {
      const notes = request.result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      resolve(notes);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getNoteById(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(NOTES_STORE, 'readonly');
    const store = tx.objectStore(NOTES_STORE);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteNote(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(NOTES_STORE, 'readwrite');
    const store = tx.objectStore(NOTES_STORE);
    const request = store.delete(id);
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}

export async function toggleFavorite(id) {
  const note = await getNoteById(id);
  if (note) {
    note.isFavorite = !note.isFavorite;
    note.updatedAt = new Date().toISOString();
    return saveNote(note);
  }
  return null;
}

export async function updateNote(id, updates) {
  const note = await getNoteById(id);
  if (note) {
    const updated = { ...note, ...updates, updatedAt: new Date().toISOString() };
    return saveNote(updated);
  }
  return null;
}

export async function searchNotes(query) {
  const allNotes = await getAllNotes();
  const q = query.toLowerCase();
  return allNotes.filter(n =>
    n.title.toLowerCase().includes(q) ||
    n.content.toLowerCase().includes(q) ||
    n.subject.toLowerCase().includes(q)
  );
}

export async function getNotesBySubject(subject) {
  const allNotes = await getAllNotes();
  return allNotes.filter(n => n.subject === subject);
}

export async function getFavoriteNotes() {
  const allNotes = await getAllNotes();
  return allNotes.filter(n => n.isFavorite);
}

export async function getStats() {
  const allNotes = await getAllNotes();
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const subjects = [...new Set(allNotes.map(n => n.subject))];
  const thisWeek = allNotes.filter(n => new Date(n.createdAt) >= weekAgo);
  const favorites = allNotes.filter(n => n.isFavorite);
  return {
    total: allNotes.length,
    subjects: subjects.length,
    thisWeek: thisWeek.length,
    favorites: favorites.length,
  };
}
