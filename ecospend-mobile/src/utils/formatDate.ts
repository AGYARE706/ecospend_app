export function getFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

export function formatHeaderDate(date: Date): string {
  return date.toLocaleDateString('en-GH', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatGroupLabel(isoDate: string, referenceDate = new Date()): string {
  const date = new Date(isoDate);
  const yesterday = new Date(referenceDate);
  yesterday.setDate(referenceDate.getDate() - 1);

  if (isSameDay(date, referenceDate)) {
    return 'Today';
  }

  if (isSameDay(date, yesterday)) {
    return 'Yesterday';
  }

  return date.toLocaleDateString('en-GH', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatTime(isoDate: string): string {
  return new Date(isoDate).toLocaleTimeString('en-GH', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatShortDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-GH', {
    day: 'numeric',
    month: 'short',
  });
}
