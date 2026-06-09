import { useState, useEffect, useCallback } from 'react';
import { fetchGoals, fetchStreak } from './api';
import GoalForm from './components/GoalForm';
import GoalList from './components/GoalList';
import StreakBanner from './components/StreakBanner';

const today = new Date().toISOString().slice(0, 10);

export default function App() {
  const [goals, setGoals] = useState([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [goalsData, streakData] = await Promise.all([
      fetchGoals(today),
      fetchStreak(),
    ]);
    setGoals(goalsData);
    setStreak(streakData.streak);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const formattedDate = new Date(today + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <div className="app">
      <header className="header">
        <h1>FitDay</h1>
        <p className="date">{formattedDate}</p>
      </header>
      <main className="main">
        <StreakBanner streak={streak} />
        <GoalForm onGoalAdded={refresh} />
        {loading ? (
          <p className="loading">Loading...</p>
        ) : (
          <GoalList goals={goals} today={today} onUpdate={refresh} />
        )}
      </main>
    </div>
  );
}
