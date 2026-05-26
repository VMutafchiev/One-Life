export interface QuizAnswers {
  age: number;
  sex: 'male' | 'female' | 'other';
  smoker: 'never' | 'quit' | 'light' | 'moderate' | 'heavy';
  alcohol: 'none' | 'occasional' | 'moderate' | 'heavy' | 'very_heavy';
  exercise: 'never' | 'low' | 'moderate' | 'high';
  bmi: 'underweight' | 'healthy' | 'overweight' | 'obese' | 'severely_obese';
  sleep: 'under5' | 'five_six' | 'seven_eight' | 'nine_plus';
  stress: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';
  diet: 'very_poor' | 'poor' | 'average' | 'good' | 'excellent';
  social: 'very_isolated' | 'few_friends' | 'average' | 'strong' | 'very_connected';
  conditions: 'none' | 'controlled' | 'heart_disease' | 'diabetes' | 'cancer' | 'multiple';
  family: 'longevity' | 'average' | 'early_death' | 'significant_early_death';
}

export interface FactorResult {
  name: string;
  years: number;
}

export const LIFE_FACTORS = {
  smoking: {
    never:    { label: 'Non-smoker',            years: 0 },
    quit:     { label: 'Quit 5+ years ago',     years: 1 },
    light:    { label: '1–10 cigarettes/day',   years: -3 },
    moderate: { label: '11–20 cigarettes/day',  years: -6.8 },
    heavy:    { label: '20+ cigarettes/day',    years: -10 },
  },
  alcohol: {
    none:       { label: 'No alcohol',           years: 1 },
    occasional: { label: 'Occasional drinker',   years: 0 },
    moderate:   { label: '3–7 drinks/week',      years: -1 },
    heavy:      { label: 'Daily drinker',        years: -4 },
    very_heavy: { label: 'Very heavy drinker',   years: -8 },
  },
  exercise: {
    never:    { label: 'No exercise',            years: -3 },
    low:      { label: '1–2x per week',          years: 0 },
    moderate: { label: '3–4x per week',          years: 3 },
    high:     { label: '5+ times per week',      years: 4 },
  },
  bmi: {
    underweight:    { label: 'Underweight',      years: -2 },
    healthy:        { label: 'Healthy weight',   years: 0 },
    overweight:     { label: 'Overweight',       years: -2 },
    obese:          { label: 'Obese',            years: -5 },
    severely_obese: { label: 'Severely obese',   years: -10 },
  },
  sleep: {
    under5:      { label: 'Under 5 hours/night',  years: -4.7 },
    five_six:    { label: '5–6 hours/night',      years: -2 },
    seven_eight: { label: '7–8 hours/night',      years: 0 },
    nine_plus:   { label: '9+ hours/night',       years: -1.5 },
  },
  stress: {
    very_low: { label: 'Very low stress',    years: 1 },
    low:      { label: 'Low stress',         years: 0 },
    moderate: { label: 'Moderate stress',    years: -1 },
    high:     { label: 'High stress',        years: -2.5 },
    very_high:{ label: 'Very high stress',   years: -4 },
  },
  diet: {
    very_poor: { label: 'Very poor diet',    years: -3 },
    poor:      { label: 'Poor diet',         years: -1.5 },
    average:   { label: 'Average diet',      years: 0 },
    good:      { label: 'Good diet',         years: 1.5 },
    excellent: { label: 'Excellent diet',    years: 3 },
  },
  social: {
    very_isolated:    { label: 'Very isolated',         years: -7 },
    few_friends:      { label: 'Few social connections', years: -3 },
    average:          { label: 'Average social life',    years: 0 },
    strong:           { label: 'Strong relationships',   years: 4 },
    very_connected:   { label: 'Very socially connected', years: 7.5 },
  },
  conditions: {
    none:          { label: 'No chronic conditions', years: 0 },
    controlled:    { label: 'Controlled condition',  years: -1 },
    heart_disease: { label: 'Heart disease',         years: -5 },
    diabetes:      { label: 'Diabetes',              years: -4 },
    cancer:        { label: 'Cancer history',        years: -8 },
    multiple:      { label: 'Multiple conditions',   years: -12 },
  },
  family: {
    longevity:              { label: 'Family lived 85+',         years: 3 },
    average:                { label: 'Family lived 70–84',       years: 0 },
    early_death:            { label: 'Many died under 70',       years: -2 },
    significant_early_death:{ label: 'Significant early death',  years: -5 },
  },
} as const;

/** Calculates estimated days remaining based on scientific life expectancy model. */
export function calculateDaysRemaining(answers: QuizAnswers): number {
  const base = 73;

  const sexBonus = answers.sex === 'female' ? 5 : answers.sex === 'other' ? 2.5 : 0;

  const smokingYears    = LIFE_FACTORS.smoking[answers.smoker].years;
  const alcoholYears    = LIFE_FACTORS.alcohol[answers.alcohol].years;
  const exerciseYears   = LIFE_FACTORS.exercise[answers.exercise].years;
  const bmiYears        = LIFE_FACTORS.bmi[answers.bmi].years;
  const sleepYears      = LIFE_FACTORS.sleep[answers.sleep].years;
  const stressYears     = LIFE_FACTORS.stress[answers.stress].years;
  const dietYears       = LIFE_FACTORS.diet[answers.diet].years;
  const socialYears     = LIFE_FACTORS.social[answers.social].years;
  const conditionsYears = LIFE_FACTORS.conditions[answers.conditions].years;
  const familyYears     = LIFE_FACTORS.family[answers.family].years;

  const totalLE =
    base +
    sexBonus +
    smokingYears +
    alcoholYears +
    exerciseYears +
    bmiYears +
    sleepYears +
    stressYears +
    dietYears +
    socialYears +
    conditionsYears +
    familyYears;

  const yearsLeft = Math.max(0, totalLE - answers.age);
  return Math.round(yearsLeft * 365.25);
}

/** Returns a breakdown of each factor's year impact for the Life Audit Card. */
export function getFactorBreakdown(answers: QuizAnswers): FactorResult[] {
  return [
    { name: LIFE_FACTORS.smoking[answers.smoker].label,       years: LIFE_FACTORS.smoking[answers.smoker].years },
    { name: LIFE_FACTORS.alcohol[answers.alcohol].label,      years: LIFE_FACTORS.alcohol[answers.alcohol].years },
    { name: LIFE_FACTORS.exercise[answers.exercise].label,    years: LIFE_FACTORS.exercise[answers.exercise].years },
    { name: LIFE_FACTORS.bmi[answers.bmi].label,              years: LIFE_FACTORS.bmi[answers.bmi].years },
    { name: LIFE_FACTORS.sleep[answers.sleep].label,          years: LIFE_FACTORS.sleep[answers.sleep].years },
    { name: LIFE_FACTORS.stress[answers.stress].label,        years: LIFE_FACTORS.stress[answers.stress].years },
    { name: LIFE_FACTORS.diet[answers.diet].label,            years: LIFE_FACTORS.diet[answers.diet].years },
    { name: LIFE_FACTORS.social[answers.social].label,        years: LIFE_FACTORS.social[answers.social].years },
    { name: LIFE_FACTORS.conditions[answers.conditions].label, years: LIFE_FACTORS.conditions[answers.conditions].years },
    { name: LIFE_FACTORS.family[answers.family].label,        years: LIFE_FACTORS.family[answers.family].years },
  ];
}
