export function vibrate(pattern: number | number[] = 50) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

export function correctFeedback() {
  vibrate(100);
}

export function incorrectFeedback() {
  vibrate([50, 50, 50]);
}

export function streakFeedback(streak: number) {
  if (streak >= 5) vibrate([100, 50, 100, 50, 100]);
  else if (streak >= 3) vibrate([100, 50, 100]);
  else vibrate(100);
}
