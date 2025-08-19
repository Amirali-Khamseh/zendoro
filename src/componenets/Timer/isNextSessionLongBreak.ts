export function isNextSessionLongBreak(focusSessionCount: number) {
  return focusSessionCount % 4 === 0;
}
