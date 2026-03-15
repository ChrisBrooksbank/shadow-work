/**
 * Vibration API wrappers for haptic feedback.
 * Silently no-ops on unsupported browsers.
 */

export function hapticTap(): void {
  if ('vibrate' in navigator) {
    navigator.vibrate(10);
  }
}

export function hapticLight(): void {
  if ('vibrate' in navigator) {
    navigator.vibrate(20);
  }
}

export function hapticMedium(): void {
  if ('vibrate' in navigator) {
    navigator.vibrate(40);
  }
}
