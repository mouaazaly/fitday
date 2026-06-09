import { useState } from 'react';
import { addGoal } from '../api';

export default function GoalForm({ onGoalAdded }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('habit');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    await addGoal(name.trim(), category);
    setName('');
    setSubmitting(false);
    onGoalAdded();
  }

  return (
    <form className="goal-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Add a daily goal..."
        value={name}
        onChange={e => setName(e.target.value)}
        disabled={submitting}
        className="goal-input"
      />
      <select
        value={category}
        onChange={e => setCategory(e.target.value)}
        className="category-select"
      >
        <option value="habit">Habit</option>
        <option value="cardio">Cardio</option>
      </select>
      <button type="submit" disabled={submitting || !name.trim()} className="add-btn">
        Add
      </button>
    </form>
  );
}
