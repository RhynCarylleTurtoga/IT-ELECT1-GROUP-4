// src/db/database.js
// Persistent-ready DB: uses native expo-sqlite if present; otherwise uses AsyncStorage-backed fallback.
// AsyncStorage fallback persists users/highscores/login_history across restarts.

import AsyncStorage from '@react-native-async-storage/async-storage';

let SQLite;
let nativeAvailable = false;
try {
  SQLite = require('expo-sqlite');
  if (SQLite && typeof SQLite.openDatabase === 'function') nativeAvailable = true;
} catch (e) {
  nativeAvailable = false;
}

let db = null;

/* -------------------------
   AsyncStorage keys & in-memory cache (fallback)
   ------------------------- */
const AS_USERS = '@nr_users_v1';
const AS_SCORES = '@nr_scores_v1';
const AS_HISTORY = '@nr_history_v1';

let memUsers = []; // {id, username, passhash, isLoggedIn, created_at, last_login}
let memScores = []; // {id, userId, player, time, mistakes, mode, gridSize, date}
let memHistory = []; // {id, userId, ts, username}

let memUserId = 1;
let memScoreId = 1;
let memHistoryId = 1;

/* -------------------------
   Helper: load fallback from AsyncStorage
   ------------------------- */
async function loadFallbackFromStorage() {
  try {
    const [uRaw, sRaw, hRaw] = await Promise.all([
      AsyncStorage.getItem(AS_USERS),
      AsyncStorage.getItem(AS_SCORES),
      AsyncStorage.getItem(AS_HISTORY),
    ]);
    memUsers = uRaw ? JSON.parse(uRaw) : [];
    memScores = sRaw ? JSON.parse(sRaw) : [];
    memHistory = hRaw ? JSON.parse(hRaw) : [];

    // set next ids
    memUserId = memUsers.length ? Math.max(...memUsers.map(x => x.id)) + 1 : 1;
    memScoreId = memScores.length ? Math.max(...memScores.map(x => x.id)) + 1 : 1;
    memHistoryId = memHistory.length ? Math.max(...memHistory.map(x => x.id)) + 1 : 1;
  } catch (e) {
    console.warn('loadFallbackFromStorage error', e);
    memUsers = [];
    memScores = [];
    memHistory = [];
    memUserId = memScoreId = memHistoryId = 1;
  }
}

async function saveFallbackToStorage() {
  try {
    await Promise.all([
      AsyncStorage.setItem(AS_USERS, JSON.stringify(memUsers)),
      AsyncStorage.setItem(AS_SCORES, JSON.stringify(memScores)),
      AsyncStorage.setItem(AS_HISTORY, JSON.stringify(memHistory)),
    ]);
  } catch (e) {
    console.warn('saveFallbackToStorage error', e);
  }
}

/* -------------------------
   initDatabase
   ------------------------- */
export async function initDatabase() {
  if (nativeAvailable) {
    db = SQLite.openDatabase('number_rush.db');
    return new Promise((resolve) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS users (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              username TEXT UNIQUE NOT NULL,
              passhash TEXT NOT NULL,
              isLoggedIn INTEGER DEFAULT 0,
              created_at TEXT,
              last_login TEXT
            );`
          );
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS highscores (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              userId INTEGER,
              player TEXT,
              time REAL,
              mistakes INTEGER,
              mode TEXT,
              gridSize INTEGER,
              date TEXT
            );`
          );
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS login_history (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              userId INTEGER,
              ts TEXT
            );`
          );
        },
        (err) => {
          console.warn('SQLite init error → switching to fallback', err);
          nativeAvailable = false;
          // fallthrough to AsyncStorage init
          (async () => { await loadFallbackFromStorage(); resolve(false); })();
        },
        () => resolve(true)
      );
    });
  }

  // fallback: load persisted arrays from AsyncStorage
  await loadFallbackFromStorage();
  console.warn('Using AsyncStorage-backed fallback for DB (persistent across restarts).');
  return true;
}

/* -------------------------
   createUser (no auto-login)
   ------------------------- */
export function createUser({ username, passhash }) {
  const createdAt = new Date().toISOString();

  if (!nativeAvailable) {
    if (memUsers.some(u => u.username === username)) {
      return Promise.reject(new Error('Username already exists'));
    }
    const u = { id: memUserId++, username, passhash, isLoggedIn: 0, created_at: createdAt, last_login: null };
    memUsers.push(u);
    return saveFallbackToStorage().then(() => ({ id: u.id, username: u.username, created_at: createdAt }));
  }

  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO users (username, passhash, isLoggedIn, created_at, last_login) VALUES (?, ?, 0, ?, NULL);`,
        [username, passhash, createdAt],
        (_, result) => resolve({ id: result.insertId, username, created_at: createdAt }),
        (_, err) => reject(err)
      );
    });
  });
}

/* -------------------------
   authenticateUser({username, passhash, remember = true})
   - records login_history, updates last_login
   - sets isLoggedIn only if remember == true
   ------------------------- */
export function authenticateUser({ username, passhash, remember = true }) {
  const now = new Date().toISOString();

  if (!nativeAvailable) {
    const user = memUsers.find(u => u.username === username && u.passhash === passhash);
    if (!user) return Promise.resolve(null);

    memHistory.push({ id: memHistoryId++, userId: user.id, ts: now, username: user.username });
    user.last_login = now;

    if (remember) {
      memUsers.forEach(u => u.isLoggedIn = 0);
      user.isLoggedIn = 1;
    } else {
      user.isLoggedIn = 0;
    }

    return saveFallbackToStorage().then(() => ({ id: user.id, username: user.username }));
  }

  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT id, username FROM users WHERE username = ? AND passhash = ? LIMIT 1;`,
        [username, passhash],
        (_, { rows }) => {
          if (!rows.length) return resolve(null);
          const user = rows._array[0];
          tx.executeSql(`INSERT INTO login_history (userId, ts) VALUES (?, ?);`, [user.id, now]);
          tx.executeSql(`UPDATE users SET last_login = ? WHERE id = ?;`, [now, user.id]);

          if (remember) {
            tx.executeSql(`UPDATE users SET isLoggedIn = 0;`);
            tx.executeSql(`UPDATE users SET isLoggedIn = 1 WHERE id = ?;`, [user.id]);
          } else {
            tx.executeSql(`UPDATE users SET isLoggedIn = 0 WHERE id = ?;`, [user.id]);
          }

          resolve(user);
        },
        (_, err) => reject(err)
      );
    });
  });
}

/* -------------------------
   getLoggedInUser
   ------------------------- */
export function getLoggedInUser() {
  if (!nativeAvailable) {
    const u = memUsers.find(x => x.isLoggedIn === 1);
    return Promise.resolve(u ? { id: u.id, username: u.username } : null);
  }

  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT id, username FROM users WHERE isLoggedIn = 1 LIMIT 1;`,
        [],
        (_, { rows }) => resolve(rows._array[0] || null),
        (_, err) => reject(err)
      );
    });
  });
}

/* -------------------------
   logoutAllUsers
   ------------------------- */
export function logoutAllUsers() {
  if (!nativeAvailable) {
    memUsers.forEach(u => u.isLoggedIn = 0);
    return saveFallbackToStorage().then(() => true);
  }
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(`UPDATE users SET isLoggedIn = 0;`, [], () => resolve(true), (_, err) => reject(err));
    });
  });
}

/* -------------------------
   addHighscore/getHighscores/clearHighscores
   ------------------------- */
export function addHighscore({ userId = null, player = 'Guest', time = 0, mistakes = 0, mode = 'classic', gridSize = 4 }) {
  const date = new Date().toISOString();
  if (!nativeAvailable) {
    const rec = { id: memScoreId++, userId, player, time, mistakes, mode, gridSize, date };
    memScores.push(rec);
    return saveFallbackToStorage().then(() => ({ insertId: rec.id }));
  }

  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO highscores (userId, player, time, mistakes, mode, gridSize, date) VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [userId, player, time, mistakes, mode, gridSize, date],
        (_, result) => resolve(result),
        (_, err) => { reject(err); return false; }
      );
    });
  });
}

export function getHighscores({ limit = 20, userId = null, gridSize = null } = {}) {
  if (!nativeAvailable) {
    let rows = memScores.slice();
    if (userId) rows = rows.filter(r => r.userId === userId);
    if (gridSize) rows = rows.filter(r => r.gridSize === gridSize);
    rows.sort((a,b) => (a.time !== b.time ? a.time - b.time : a.mistakes - b.mistakes));
    return Promise.resolve(rows.slice(0, limit));
  }

  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      let sql = `SELECT h.*, u.username FROM highscores h LEFT JOIN users u ON h.userId = u.id`;
      const params = [];
      const clauses = [];
      if (userId) { clauses.push(`h.userId = ?`); params.push(userId); }
      if (gridSize) { clauses.push(`h.gridSize = ?`); params.push(gridSize); }
      if (clauses.length) sql += ' WHERE ' + clauses.join(' AND ');
      sql += ' ORDER BY h.time ASC, h.mistakes ASC LIMIT ?;'; params.push(limit);
      tx.executeSql(sql, params, (_, { rows }) => resolve(rows._array), (_, err) => { reject(err); return false; });
    });
  });
}

export function clearHighscores() {
  if (!nativeAvailable) {
    memScores.length = 0;
    return saveFallbackToStorage().then(() => true);
  }
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(`DELETE FROM highscores;`, [], () => resolve(true), (_, err) => reject(err));
    });
  });
}

/* -------------------------
   getAllUsers/getLoginHistory
   ------------------------- */
export function getAllUsers() {
  if (!nativeAvailable) {
    return Promise.resolve(memUsers.map(u => ({ id: u.id, username: u.username, created_at: u.created_at, last_login: u.last_login })));
  }
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(`SELECT id, username, created_at, last_login FROM users ORDER BY id ASC;`, [], (_, { rows }) => resolve(rows._array), (_, err) => reject(err));
    });
  });
}

export function getLoginHistory({ limit = 100, userId = null } = {}) {
  if (!nativeAvailable) {
    let rows = memHistory.slice().reverse();
    if (userId) rows = rows.filter(r => r.userId === userId);
    return Promise.resolve(rows.slice(0, limit));
  }
  return new Promise((resolve, reject) => {
    let sql = `SELECT l.id, l.userId, l.ts, u.username FROM login_history l LEFT JOIN users u ON l.userId = u.id`;
    const params = [];
    if (userId) { sql += ' WHERE l.userId = ?'; params.push(userId); }
    sql += ' ORDER BY l.ts DESC LIMIT ?;'; params.push(limit);
    db.transaction((tx) => {
      tx.executeSql(sql, params, (_, { rows }) => resolve(rows._array), (_, err) => reject(err));
    });
  });
}