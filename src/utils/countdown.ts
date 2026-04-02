export interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  timeLeft: string;
}

export function calculateCountdown(startDate: string | Date): CountdownResult {
  const start = new Date(startDate);
  const now = new Date();
  const timeDiff = start.getTime() - now.getTime();

  if (timeDiff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      timeLeft: "Started"
    };
  }

  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

  let timeLeft = "";
  if (days > 0) {
    timeLeft = `${days} day${days > 1 ? 's' : ''} left`;
  } else {
    // Show HH:MM:SS for the final 24 hours
    const h = hours.toString().padStart(2, '0');
    const m = minutes.toString().padStart(2, '0');
    const s = seconds.toString().padStart(2, '0');
    timeLeft = `${h}:${m}:${s} left`;
  }

  return {
    days,
    hours,
    minutes,
    seconds,
    isExpired: false,
    timeLeft
  };
}

export function formatStartDate(startDate: string | Date): string {
  const date = new Date(startDate);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}