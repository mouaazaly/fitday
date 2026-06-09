export default function StreakBanner({ streak }) {
  if (streak === 0) {
    return (
      <div className="streak-banner zero">
        <span className="streak-icon">🔥</span>
        <span>Complete all goals to start your streak!</span>
      </div>
    );
  }

  return (
    <div className="streak-banner active">
      <span className="streak-icon">🔥</span>
      <span className="streak-count">{streak}</span>
      <span className="streak-label">{streak === 1 ? 'day streak' : 'day streak'}</span>
    </div>
  );
}
