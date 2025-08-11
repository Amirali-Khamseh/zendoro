//TODO : deal with the negative values when the input is to low

export function formatTime(time: number) {
  const seconds = Math.floor((time / 1000) % 60);
  const minutes = Math.floor((time / (1000 * 60)) % 60);
  return `${minutes} : ${seconds}`;
}
