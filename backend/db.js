const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'fitday.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS goals (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    category    TEXT NOT NULL DEFAULT 'habit',
    created_at  TEXT DEFAULT (date('now'))
  );

  CREATE TABLE IF NOT EXISTS completions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    goal_id     INTEGER NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    date        TEXT NOT NULL,
    UNIQUE(goal_id, date)
  );
`);

function getGoalsWithStatus(date) {
  return db.prepare(`
    SELECT g.id, g.name, g.category,
           CASE WHEN c.id IS NOT NULL THEN 1 ELSE 0 END AS completed
    FROM goals g
    LEFT JOIN completions c ON c.goal_id = g.id AND c.date = ?
    ORDER BY g.id
  `).all(date);
}

function createGoal(name, category) {
  const result = db.prepare('INSERT INTO goals (name, category) VALUES (?, ?)').run(name, category);
  return db.prepare('SELECT * FROM goals WHERE id = ?').get(result.lastInsertRowid);
}

function deleteGoal(id) {
  return db.prepare('DELETE FROM goals WHERE id = ?').run(id);
}

function checkOff(goalId, date) {
  return db.prepare('INSERT OR IGNORE INTO completions (goal_id, date) VALUES (?, ?)').run(goalId, date);
}

function uncheck(goalId, date) {
  return db.prepare('DELETE FROM completions WHERE goal_id = ? AND date = ?').run(goalId, date);
}

function getStreak() {
  const totalGoals = db.prepare('SELECT COUNT(*) as count FROM goals').get().count;
  if (totalGoals === 0) return 0;

  const completionsByDate = {};
  for (const row of db.prepare('SELECT date, COUNT(*) as count FROM completions GROUP BY date').all()) {
    completionsByDate[row.date] = row.count;
  }

  const today = new Date().toISOString().slice(0, 10);
  const todayDone = (completionsByDate[today] || 0) >= totalGoals;

  // Start counting from today (if complete) or yesterday
  const cursor = new Date(today);
  if (!todayDone) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  while (streak <= 365) {
    const dateStr = cursor.toISOString().slice(0, 10);
    if ((completionsByDate[dateStr] || 0) >= totalGoals) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

module.exports = { getGoalsWithStatus, createGoal, deleteGoal, checkOff, uncheck, getStreak };
