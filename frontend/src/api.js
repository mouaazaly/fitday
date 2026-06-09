export async function fetchGoals(date) {
  const res = await fetch(`/api/goals?date=${date}`);
  return res.json();
}

export async function fetchStreak() {
  const res = await fetch('/api/streak');
  return res.json();
}

export async function addGoal(name, category) {
  const res = await fetch('/api/goals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, category }),
  });
  return res.json();
}

export async function deleteGoal(id) {
  await fetch(`/api/goals/${id}`, { method: 'DELETE' });
}

export async function checkGoal(goalId, date) {
  await fetch('/api/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ goal_id: goalId, date }),
  });
}

export async function uncheckGoal(goalId, date) {
  await fetch(`/api/completions/${goalId}/${date}`, { method: 'DELETE' });
}
