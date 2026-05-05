/**
 * Progress Tracking — localStorage persistence for lesson scores and stats
 */
const Progress = (() => {
  const STORAGE_KEY = 'pianoMentor_progress';

  function load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : getDefault();
    } catch {
      return getDefault();
    }
  }

  function save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function getDefault() {
    return {
      lessons: {},        // { lessonId: { stars, bestScore, attempts, lastPlayed } }
      totalPracticeTime: 0,
      sessionsCount: 0,
    };
  }

  function saveLesson(lessonId, results) {
    const data = load();
    const existing = data.lessons[lessonId];

    data.lessons[lessonId] = {
      stars: Math.max(results.stars, existing?.stars || 0),
      bestScore: Math.max(results.score, existing?.bestScore || 0),
      attempts: (existing?.attempts || 0) + 1,
      lastPlayed: Date.now(),
    };

    save(data);
  }

  function getLessonProgress(lessonId) {
    const data = load();
    return data.lessons[lessonId] || null;
  }

  function isLessonUnlocked() {
    return true;
  }

  function getTotalStars() {
    const data = load();
    return Object.values(data.lessons).reduce((sum, l) => sum + (l.stars || 0), 0);
  }

  function getCompletedCount() {
    const data = load();
    return Object.values(data.lessons).filter(l => l.stars >= 1).length;
  }

  function getMaxStars() {
    return Lessons.getAllLessons().length * 3;
  }

  function getAllProgress() {
    return load();
  }

  return {
    saveLesson, getLessonProgress, isLessonUnlocked,
    getTotalStars, getCompletedCount, getMaxStars, getAllProgress,
  };
})();
