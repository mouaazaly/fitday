const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/goals', (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  res.json(db.getGoalsWithStatus(date));
});

app.post('/api/goals', (req, res) => {
  const { name, category = 'habit' } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Goal name is required' });
  res.status(201).json(db.createGoal(name.trim(), category));
});

app.delete('/api/goals/:id', (req, res) => {
  db.deleteGoal(parseInt(req.params.id));
  res.status(204).end();
});

app.post('/api/completions', (req, res) => {
  const { goal_id, date } = req.body;
  if (!goal_id || !date) return res.status(400).json({ error: 'goal_id and date required' });
  db.checkOff(goal_id, date);
  res.status(201).end();
});

app.delete('/api/completions/:goalId/:date', (req, res) => {
  db.uncheck(parseInt(req.params.goalId), req.params.date);
  res.status(204).end();
});

app.get('/api/streak', (req, res) => {
  res.json({ streak: db.getStreak() });
});

// Serve frontend
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, () => console.log(`FitDay backend → http://localhost:${PORT}`));
