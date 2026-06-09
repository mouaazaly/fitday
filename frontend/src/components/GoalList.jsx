import { checkGoal, uncheckGoal, deleteGoal } from '../api';

export default function GoalList({ goals, today, onUpdate }) {
  if (goals.length === 0) {
    return <p className="empty">No goals yet. Add one above!</p>;
  }

  const completed = goals.filter(g => g.completed).length;
  const allDone = completed === goals.length;

  async function handleToggle(goal) {
    if (goal.completed) {
      await uncheckGoal(goal.id, today);
    } else {
      await checkGoal(goal.id, today);
    }
    onUpdate();
  }

  async function handleDelete(id) {
    await deleteGoal(id);
    onUpdate();
  }

  return (
    <div className="goal-list">
      <div className="progress-header">
        <span className="progress-text">{completed} / {goals.length} completed</span>
        {allDone && <span className="all-done-badge">All done!</span>}
      </div>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${(completed / goals.length) * 100}%` }}
        />
      </div>
      <ul className="goals">
        {goals.map(goal => (
          <li key={goal.id} className={`goal-item${goal.completed ? ' done' : ''}`}>
            <button
              className={`checkbox${goal.completed ? ' checked' : ''}`}
              onClick={() => handleToggle(goal)}
              aria-label={goal.completed ? 'Uncheck' : 'Check'}
            >
              {goal.completed && '✓'}
            </button>
            <div className="goal-info">
              <span className="goal-name">{goal.name}</span>
              <span className={`category-tag ${goal.category}`}>{goal.category}</span>
            </div>
            <button
              className="delete-btn"
              onClick={() => handleDelete(goal.id)}
              aria-label="Delete goal"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
