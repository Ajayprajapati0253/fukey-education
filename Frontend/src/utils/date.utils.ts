import { formatDistanceToNow, parseISO, isValid } from 'date-fns';

/**
 * Formats an ISO date string or Date object into a human-friendly relative time string.
 * e.g., "5 minutes ago", "2 hours ago"
 */
export function formatRelativeTime(dateInput: string | Date | number): string {
  try {
    const date = typeof dateInput === 'string' ? parseISO(dateInput) : new Date(dateInput);
    if (!isValid(date)) return String(dateInput);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return String(dateInput);
  }
}

/**
 * Returns greeting depending on the current hour of the day.
 */
export function getTimeBasedGreeting(name: string = 'Admin'): { greeting: string; emoji: string } {
  const hour = new Date().getHours();
  if (hour < 12) {
    return { greeting: `Good morning, ${name}`, emoji: '👋' };
  } else if (hour < 17) {
    return { greeting: `Good afternoon, ${name}`, emoji: '👋' };
  } else {
    return { greeting: `Good evening, ${name}`, emoji: '👋' };
  }
}
