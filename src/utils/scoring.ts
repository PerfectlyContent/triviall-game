export function calculatePoints(
  isCorrect: boolean,
  streak: number,
  timeElapsed: number,
  timeLimit: number,
): { points: number; newStreak: number; multiplier: number } {
  if (!isCorrect) return { points: 0, newStreak: 0, multiplier: 1 };

  const newStreak = streak + 1;
  const basePoints = 10;

  const timeRatio = Math.max(0, 1 - timeElapsed / timeLimit);
  const timeBonus = Math.round(timeRatio * 5);

  let multiplier = 1;
  if (newStreak >= 5) multiplier = 2.5;
  else if (newStreak >= 3) multiplier = 2;
  else if (newStreak >= 2) multiplier = 1.5;

  const points = Math.round((basePoints + timeBonus) * multiplier);
  return { points, newStreak, multiplier };
}

export function adjustDifficulty(
  currentDifficulty: number,
  isCorrect: boolean,
  streak: number,
): number {
  if (isCorrect && streak >= 2) {
    return Math.min(10, currentDifficulty + 1);
  } else if (!isCorrect) {
    return Math.max(1, currentDifficulty - 1);
  }
  return currentDifficulty;
}
