import { ProgressPhoto, RoutineLog, UserStats } from '../types';

const DB_NAME = 'BananaSplitDB';
const DB_VERSION = 1;
const PHOTO_STORE = 'photos';
const LOGS_STORE = 'logs';

let dbInstance: IDBDatabase | null = null;

// Helper to open IndexedDB
function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(PHOTO_STORE)) {
          db.createObjectStore(PHOTO_STORE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(LOGS_STORE)) {
          db.createObjectStore(LOGS_STORE, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        dbInstance = (event.target as IDBOpenDBRequest).result;
        resolve(dbInstance);
      };

      request.onerror = (event) => {
        console.warn('IndexedDB failed to open, falling back to memory/localStorage', event);
        reject(request.error || new Error('Failed to open database'));
      };
    } catch (e) {
      console.warn('IndexedDB not supported or accessible, falling back', e);
      reject(e);
    }
  });
}

// Fallbacks using LocalStorage for compatibility and failsafe operation
const LS_PHOTOS_KEY = 'banana_split_photos_fallback';
const LS_LOGS_KEY = 'banana_split_logs_fallback';

function getLSFallback<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveLSFallback<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('LocalStorage write failed', e);
  }
}

// Database Actions
export async function saveProgressPhoto(photo: ProgressPhoto): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(PHOTO_STORE, 'readwrite');
      const store = transaction.objectStore(PHOTO_STORE);
      const request = store.put(photo);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    // Fallback
    const photos = getLSFallback<ProgressPhoto>(LS_PHOTOS_KEY);
    const index = photos.findIndex(p => p.id === photo.id);
    if (index >= 0) {
      photos[index] = photo;
    } else {
      photos.push(photo);
    }
    saveLSFallback(LS_PHOTOS_KEY, photos);
  }
}

export async function getAllProgressPhotos(): Promise<ProgressPhoto[]> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(PHOTO_STORE, 'readonly');
      const store = transaction.objectStore(PHOTO_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result as ProgressPhoto[];
        // Sort by date descending
        results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    const photos = getLSFallback<ProgressPhoto>(LS_PHOTOS_KEY);
    photos.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return photos;
  }
}

export async function deleteProgressPhoto(id: string): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(PHOTO_STORE, 'readwrite');
      const store = transaction.objectStore(PHOTO_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    const photos = getLSFallback<ProgressPhoto>(LS_PHOTOS_KEY);
    const filtered = photos.filter(p => p.id !== id);
    saveLSFallback(LS_PHOTOS_KEY, filtered);
  }
}

export async function saveRoutineLog(log: RoutineLog): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(LOGS_STORE, 'readwrite');
      const store = transaction.objectStore(LOGS_STORE);
      const request = store.put(log);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    const logs = getLSFallback<RoutineLog>(LS_LOGS_KEY);
    const index = logs.findIndex(l => l.id === log.id);
    if (index >= 0) {
      logs[index] = log;
    } else {
      logs.push(log);
    }
    saveLSFallback(LS_LOGS_KEY, logs);
  }
}

export async function getAllRoutineLogs(): Promise<RoutineLog[]> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(LOGS_STORE, 'readonly');
      const store = transaction.objectStore(LOGS_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    return getLSFallback<RoutineLog>(LS_LOGS_KEY);
  }
}

// Calculate User Stats based on Logs
export async function getUserStats(): Promise<UserStats> {
  const logs = await getAllRoutineLogs();
  const completedLogs = logs.filter(l => l.completed);

  if (completedLogs.length === 0) {
    return {
      streak: 0,
      lastCompletedDate: null,
      totalSessions: 0,
      totalMinutes: 0
    };
  }

  // Calculate total minutes
  const totalMinutes = Math.round(completedLogs.reduce((sum, log) => sum + log.durationCompleted, 0) / 60);

  // Group completed logs by date (YYYY-MM-DD)
  const completedDates = Array.from(new Set(completedLogs.map(l => l.date))).sort();

  // Calculate current streak
  let streak = 0;
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const hasStretchedToday = completedDates.includes(todayStr);
  const hasStretchedYesterday = completedDates.includes(yesterdayStr);

  if (hasStretchedToday || hasStretchedYesterday) {
    streak = 1;
    let checkerDate = new Date(hasStretchedToday ? todayStr : yesterdayStr);

    while (true) {
      checkerDate.setDate(checkerDate.getDate() - 1);
      const checkerStr = checkerDate.toISOString().split('T')[0];
      if (completedDates.includes(checkerStr)) {
        streak++;
      } else {
        break;
      }
    }
  }

  return {
    streak,
    lastCompletedDate: completedDates[completedDates.length - 1] || null,
    totalSessions: completedLogs.length,
    totalMinutes
  };
}
