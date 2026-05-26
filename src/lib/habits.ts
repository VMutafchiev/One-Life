export interface Habit {
  id: string;
  name: string;
  minutesAdded: number;
  icon: string;
  description: string;
}

export const DAILY_CAP_MINUTES = 480;

export const HABITS: Habit[] = [
  {
    id: 'water',
    name: 'Drank 2L water',
    minutesAdded: 120,
    icon: '💧',
    description: 'Hydration is linked to cellular longevity markers.',
  },
  {
    id: 'exercise',
    name: 'Exercised 30+ min',
    minutesAdded: 90,
    icon: '🏃',
    description: '150 min/week of exercise adds 3.4 years (Harvard 2022).',
  },
  {
    id: 'sleep',
    name: 'Slept 7–8 hours',
    minutesAdded: 60,
    icon: '😴',
    description: 'Optimal sleep window per Matthew Walker\'s research.',
  },
  {
    id: 'socialise',
    name: 'Socialised 1+ hour',
    minutesAdded: 60,
    icon: '🤝',
    description: 'Strong social connection adds up to 7.5 years (Holt-Lunstad 2015).',
  },
  {
    id: 'meditate',
    name: 'Meditated / breathed',
    minutesAdded: 30,
    icon: '🧘',
    description: 'Meditation is linked to longer telomere length.',
  },
  {
    id: 'no_alcohol',
    name: 'No alcohol today',
    minutesAdded: 60,
    icon: '🚫',
    description: 'Avoiding alcohol reduces mortality risk (WHO data).',
  },
  {
    id: 'whole_food',
    name: 'Ate a whole food meal',
    minutesAdded: 45,
    icon: '🥗',
    description: 'Mediterranean diet adds 1.5–3 years of life expectancy.',
  },
  {
    id: 'read',
    name: 'Read / learned 20+ min',
    minutesAdded: 20,
    icon: '📖',
    description: 'Reading builds cognitive reserve and reduces dementia risk.',
  },
];
