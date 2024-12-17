export function playSound() {
    const audio = new Audio("/bell.mp3");
    audio.play().catch(console.error);
  }