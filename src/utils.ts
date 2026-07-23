import { firebaseApi } from './lib/firebaseApi';
/**
 * Deterministically generates a 3-digit number based on a string input (e.g. email or username)
 */
export function getDeterministicTag(input: string): string {
  if (!input) {
    // Generate a randomized 3-digit number if no input is provided
    return (Math.floor(Math.random() * 900) + 100).toString();
  }
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  const code = Math.abs(hash % 900) + 100; // Generate between 100 and 999
  return code.toString();
}

/**
 * Masks an email address for privacy (e.g. ghostfirehub@gmail.com -> gh***ub@gmail.com)
 */
export function maskEmail(email: string): string {
  if (!email) return '***@***.***';
  const parts = email.split('@');
  if (parts.length !== 2) return '***';
  const local = parts[0];
  const domain = parts[1];
  
  if (local.length <= 3) {
    return `${local[0]}***@${domain}`;
  }
  const firstChars = local.substring(0, 2);
  const lastChars = local.substring(local.length - 2);
  return `${firstChars}***${lastChars}@${domain}`;
}

/**
 * Standardizes the display name of a user or post author by masking emails and appending hashtags deterministically.
 */
export function formatDisplayName(username: string, email?: string): string {
  const name = username || 'Player';
  const targetEmail = email || (name.includes('@') ? name : undefined);
  
  // If the author is a known admin or has admin-like username
  if (
    name.toLowerCase() === 'ghostfireadmin' || 
    name.toLowerCase() === 'admin' || 
    targetEmail === 'ghostfirehub@gmail.com' || 
    targetEmail === 'ghostfire@ghost.com' ||
    name === 'ghostfirehub@gmail.com'
  ) {
    const tag = getDeterministicTag(targetEmail || name);
    return `Admin#${tag}`;
  }
  
  // Mask name if it is an email
  let displayName = name;
  if (name.includes('@')) {
    displayName = maskEmail(name);
  }
  
  const tag = getDeterministicTag(targetEmail || name);
  return `${displayName}#${tag}`;
}

/**
 * Sends a background request to log/increment daily mission progress for a user
 * and dispatches a custom event to update local application states.
 */
export async function trackMissionProgress(email: string | undefined, actionType: 'calibrate' | 'save_sens' | 'save_hud' | 'view_device' | 'read_community' | 'view_marketplace') {
  if (!email) return;
  try {
    const res = await firebaseApi.request('user/missions/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, actionType })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.user) {
        // Dispatch custom event so App.tsx can update local states
        window.dispatchEvent(new CustomEvent('user-profile-updated', { detail: data.user }));
      }
    }
  } catch (err) {
    console.error('Error tracking mission progress:', err);
  }
}
