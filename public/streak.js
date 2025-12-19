// Streak tracking module
const STREAK_STORAGE_KEY = 'artornot_streak';

function getLocalStreak() {
    const stored = localStorage.getItem(STREAK_STORAGE_KEY);
    return stored ? JSON.parse(stored) : { current: 0, best: 0 };
}

function saveLocalStreak(streak) {
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(streak));
}

function updateStreak(predictionCorrect) {
    const streak = getLocalStreak();

    if (predictionCorrect) {
        streak.current++;
        if (streak.current > streak.best) {
            streak.best = streak.current;
        }
    } else {
        streak.current = 0;
    }

    saveLocalStreak(streak);
    updateStreakDisplay(streak.current);

    return streak;
}

function updateStreakDisplay(count) {
    const display = document.getElementById('streak-display');
    const countEl = display.querySelector('.streak-count');

    if (count > 0) {
        display.classList.remove('hidden');
        countEl.textContent = count;

        // Add "hot" class for streaks of 5+
        if (count >= 5) {
            display.classList.add('hot');
        } else {
            display.classList.remove('hot');
        }
    } else {
        display.classList.add('hidden');
    }
}

function initStreak() {
    const streak = getLocalStreak();
    updateStreakDisplay(streak.current);
}
