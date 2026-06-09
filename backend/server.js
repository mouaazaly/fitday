const express = require('express');
const cors = require('cors');
const path = require('path');
const { run, get, all } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/goals', async (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  const goals = await all('SELECT * FROM goals');
  const completions = await all('SELECT goal_id FROM completions WHERE date = ?', [date]);
  const completedIds = new Set(completions.map(c => c.goal_id));
  res.json(goals.map(g => ({ ...g, completed: completedIds.has(g.id) })));
});

app.post('/api/goals', async (req, res) => {
  const { name, category = 'habit' } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Goal name is required' });
  const result = await run('INSERT INTO goals (name, category) VALUES (?, ?)', [name.trim(), category]);
  const goal = await get('SELECT * FROM goals WHERE id = ?', [result.lastID]);
  res.status(201).json(goal);
});

app.delete('/api/goals/:id', async (req, res) => {
  await run('DELETE FROM goals WHERE id = ?', [req.params.id]);
  res.status(204).end();
});

app.post('/api/completions', async (req, res) => {
  const { goal_id, date } = req.body;
  if (!goal_id || !date) return res.status(400).json({ error: 'goal_id and date required' });
  await run('INSERT OR IGNORE INTO completions (goal_id, date) VALUES (?, ?)', [goal_id, date]);
  res.status(201).end();
});

app.delete('/api/completions/:goalId/:date', async (req, res) => {
  await run('DELETE FROM completions WHERE goal_id = ? AND date = ?', [req.params.goalId, req.params.date]);
  res.status(204).end();
});

app.get('/api/streak', async (req, res) => {
  const totalGoals = (await get('SELECT COUNT(*) as count FROM goals')).count;
  if (totalGoals === 0) return res.json({ streak: 0 });
  const completionsByDate = {};
  const rows = await all('SELECT date, COUNT(*) as count FROM completions GROUP BY date');
  rows.forEach(r => completionsByDate[r.date] = r.count);
  const today = new Date().toISOString().slice(0, 10);
  const cursor = new Date();
  const todayDone = (completionsByDate[today] || 0) >= totalGoals;
  if (!todayDone) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (streak <= 365) {
    const dateStr = cursor.toISOString().slice(0, 10);
    if ((completionsByDate[dateStr] || 0) >= totalGoals) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else break;
  }
  res.json({ streak });
});

app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, () => console.log(`FitDay backend → http://localhost:${PORT}`));
