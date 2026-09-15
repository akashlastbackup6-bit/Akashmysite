/**
 * Haptic feedback utility utilizing the HTML5 Vibration API (navigator.vibrate).
 * Specifically tuned for mobile touch devices (such as Android devices) to provide
 * satisfying physical tactile response on key interactions:
 * - Liking a post (rhythmic double-pulse heart beat)
 * - Opening or entering the admin menu (firm administrative pattern)
 * - Successful sign in / authentication (celebratory sequence)
 * - Mode & tab switching (subtle micro-clicks)
 */

export const isVibrationSupported = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    typeof navigator.vibrate === 'function'
  );
};

export const triggerVibration = (pattern: number | number[]): boolean => {
  if (!isVibrationSupported()) return false;
  try {
    return navigator.vibrate(pattern);
  } catch (err) {
    // Graceful silence if browser blocks without active user gesture
    console.debug('Vibration API blocked or not supported:', err);
    return false;
  }
};

export const haptic = {
  /**
   * Subtle micro-tap for general interactive elements (tab switches, brand switches)
   */
  light: () => triggerVibration(12),

  /**
   * Standard medium tap for drawer openings, filters, or selections
   */
  medium: () => triggerVibration(24),

  /**
   * Rhythmic double-pulse for liking a post (heart beat feel: 18ms pulse, 30ms gap, 24ms pulse)
   */
  like: () => triggerVibration([18, 30, 24]),

  /**
   * Subtle single tap for unliking a post
   */
  unlike: () => triggerVibration(16),

  /**
   * Firm, authoritative pattern when opening the admin panel or accessing admin tools
   */
  admin: () => triggerVibration([32, 40, 26]),

  /**
   * Celebratory ascending pattern for successful sign-in or account creation
   */
  signIn: () => triggerVibration([20, 35, 22, 35, 42]),

  /**
   * Success notification (e.g. post published, profile updated)
   */
  success: () => triggerVibration([18, 32, 28]),

  /**
   * Failure / warning buzz
   */
  error: () => triggerVibration([45, 60, 45]),
};
