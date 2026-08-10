import { MotivationalQuote, QuoteCategory } from '../types';

export function getTimeOfDayGreeting(): { greeting: string; message: string; badge: string } {
  const hour = new Date().getHours();

  if (hour >= 22 || hour < 4) {
    return {
      badge: '🌙 LATE-NIGHT FOCUS',
      greeting: 'STILL STUDYING, CHAMPION?',
      message: "Most people are scrolling right now. You're building something that lasts."
    };
  } else if (hour >= 4 && hour < 12) {
    return {
      badge: '☀️ MORNING CLARITY',
      greeting: 'GOOD MORNING, STUDENT.',
      message: 'Before the world gets loud, get one focused session done.'
    };
  } else if (hour >= 12 && hour < 17) {
    return {
      badge: '☕ AFTERNOON MOMENTUM',
      greeting: 'ENERGY LOW? START WITH 15 MINUTES.',
      message: 'Momentum comes after starting. Pick up the pen and write the first step.'
    };
  } else {
    return {
      badge: '🌆 EVENING DEDICATION',
      greeting: 'EVENING STUDY SESSION.',
      message: 'Finish today with pride. What will you conquer before rest?'
    };
  }
}

export function getCountdownMotivationContext(daysLeft: number): string {
  if (daysLeft > 150) {
    return `${daysLeft} days is enough to completely change your preparation — if you use them right now.`;
  } else if (daysLeft > 90) {
    return `${daysLeft} days left. Consistency matters far more than short-term intensity now.`;
  } else if (daysLeft > 30) {
    return `${daysLeft} days remaining. Revision, formula recall, and PYQs take top priority.`;
  } else if (daysLeft > 7) {
    return `Only ${daysLeft} days left! Stay steady, sleep well, and trust your consistent preparation.`;
  } else if (daysLeft > 0) {
    return `${daysLeft} days to go! Stay calm, breathe, and review key high-yield formulas with confidence.`;
  } else {
    return `THE EXAM IS TODAY! Trust your hard work and execute with quiet confidence.`;
  }
}

export function getRandomQuote(quotes: MotivationalQuote[], category?: QuoteCategory): MotivationalQuote {
  const activeQuotes = quotes.filter(q => q.is_active);
  if (activeQuotes.length === 0) {
    return {
      id: 'fallback',
      text: 'KNOW THE DATE. USE THE TIME. BUILD THE RESULT.',
      author: 'PeaceGhost Study System',
      category: 'discipline',
      is_active: true
    };
  }

  if (category) {
    const categoryQuotes = activeQuotes.filter(q => q.category === category);
    if (categoryQuotes.length > 0) {
      const index = Math.floor(Math.random() * categoryQuotes.length);
      return categoryQuotes[index];
    }
  }

  const index = Math.floor(Math.random() * activeQuotes.length);
  return activeQuotes[index];
}

export function calculateTimeRemaining(targetDateStr: string) {
  const target = new Date(targetDateStr).getTime();
  const now = new Date().getTime();
  const diff = target - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalDays: 0, isPassed: true };
  }

  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  return {
    days,
    hours,
    minutes,
    seconds,
    totalDays: days,
    isPassed: false
  };
}
