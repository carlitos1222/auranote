import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

function getUserNotesRef(userId) {
  return collection(db, 'users', userId, 'notes');
}

export async function saveNoteToCloud(userId, noteData) {
  const noteId = noteData.id || doc(collection(db, '_')).id;
  const noteRef = doc(db, 'users', userId, 'notes', noteId);
  const note = {
    id: noteId,
    title: noteData.title || 'Sin título',
    content: noteData.content || '',
    type: noteData.type || 'topic',
    subject: noteData.subject || 'General',
    source: noteData.source || '',
    createdAt: noteData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isFavorite: noteData.isFavorite || false,
    storage: 'cloud',
  };
  await setDoc(noteRef, note);
  return note;
}

export async function getAllNotesFromCloud(userId) {
  const notesRef = getUserNotesRef(userId);
  const q = query(notesRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
}

export async function getNoteFromCloud(userId, noteId) {
  const noteRef = doc(db, 'users', userId, 'notes', noteId);
  const snapshot = await getDoc(noteRef);
  if (snapshot.exists()) {
    return { ...snapshot.data(), id: snapshot.id };
  }
  return null;
}

export async function deleteNoteFromCloud(userId, noteId) {
  const noteRef = doc(db, 'users', userId, 'notes', noteId);
  await deleteDoc(noteRef);
  return true;
}

export async function toggleFavoriteInCloud(userId, noteId) {
  const note = await getNoteFromCloud(userId, noteId);
  if (note) {
    const noteRef = doc(db, 'users', userId, 'notes', noteId);
    await updateDoc(noteRef, { 
      isFavorite: !note.isFavorite, 
      updatedAt: new Date().toISOString() 
    });
    return { ...note, isFavorite: !note.isFavorite };
  }
  return null;
}

export async function updateNoteInCloud(userId, noteId, updates) {
  const noteRef = doc(db, 'users', userId, 'notes', noteId);
  await updateDoc(noteRef, { 
    ...updates, 
    updatedAt: new Date().toISOString() 
  });
  return true;
}

export async function searchNotesInCloud(userId, searchQuery) {
  const allNotes = await getAllNotesFromCloud(userId);
  const q = searchQuery.toLowerCase();
  return allNotes.filter(n =>
    n.title.toLowerCase().includes(q) ||
    n.content.toLowerCase().includes(q) ||
    n.subject.toLowerCase().includes(q)
  );
}

export async function getCloudStats(userId) {
  const allNotes = await getAllNotesFromCloud(userId);
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
