/**
 * Scoring Engine — accuracy calculation and star ratings
 */
const Scoring = (() => {
  let currentResults = null;

  const POINTS = {
    perfect: 100,
    good: 75,
    ok: 50,
    miss: 0,
  };

  function calculate(notes) {
    const total = notes.length;
    if (total === 0) return { score: 0, stars: 0, accuracy: 0, perfect: 0, good: 0, ok: 0, missed: 0, total: 0 };

    let perfect = 0, good = 0, ok = 0, missed = 0;
    let totalPoints = 0;

    notes.forEach(n => {
      if (n.hit) {
        if (n.hitQuality === 'perfect') { perfect++; totalPoints += POINTS.perfect; }
        else if (n.hitQuality === 'good') { good++; totalPoints += POINTS.good; }
        else { ok++; totalPoints += POINTS.ok; }
      } else {
        missed++;
      }
    });

    const maxPoints = total * POINTS.perfect;
    const score = Math.round((totalPoints / maxPoints) * 100);
    const accuracy = Math.round(((total - missed) / total) * 100);

    let stars = 0;
    if (score >= 95) stars = 3;
    else if (score >= 75) stars = 2;
    else if (score >= 50) stars = 1;

    currentResults = { score, stars, accuracy, perfect, good, ok, missed, total };
    return currentResults;
  }

  function getResults() {
    return currentResults;
  }

  return { calculate, getResults };
})();
