export interface Quote {
  text: string;
  author: string;
}

export const QUOTES: Quote[] = [
  { text: 'You have power over your mind, not outside events. Realize this, and you will find strength.', author: 'Marcus Aurelius' },
  { text: 'The impediment to action advances action. What stands in the way becomes the way.', author: 'Marcus Aurelius' },
  { text: 'Waste no more time arguing about what a good man should be. Be one.', author: 'Marcus Aurelius' },
  { text: 'When you wake up in the morning, tell yourself: the people I deal with today will be meddling, ungrateful, arrogant, dishonest, jealous, and surly. They are this way because they cannot tell good from evil. But I have seen the beauty of good, and the ugliness of evil, and have recognized that the wrongdoer has a nature related to my own.', author: 'Marcus Aurelius' },
  { text: 'Confine yourself to the present.', author: 'Marcus Aurelius' },
  { text: 'The first rule is to keep an untroubled spirit. The second is to look things in the face and know them for what they are.', author: 'Marcus Aurelius' },
  { text: 'It is not death that a man should fear, but he should fear never beginning to live.', author: 'Marcus Aurelius' },
  { text: 'Do not indulge in dreams of what you have not, but count the blessings you actually possess and think how much you would desire them if they were not already yours.', author: 'Marcus Aurelius' },
  { text: 'Begin at once to live, and count each separate day as a separate life.', author: 'Seneca' },
  { text: 'Omnia aliena sunt, tempus tantum nostrum est. (Everything is alien to us; time alone is ours.)', author: 'Seneca' },
  { text: 'It is not that we have a short time to live, but that we waste a good deal of it.', author: 'Seneca' },
  { text: 'Luck is what happens when preparation meets opportunity.', author: 'Seneca' },
  { text: 'He who is brave is free.', author: 'Seneca' },
  { text: 'We suffer more in imagination than in reality.', author: 'Seneca' },
  { text: 'Life is long if you know how to use it.', author: 'Seneca' },
  { text: 'Retire into yourself as much as you can. Associate with people who are likely to improve you.', author: 'Seneca' },
  { text: 'Make the best use of what is in your power, and take the rest as it happens.', author: 'Epictetus' },
  { text: 'He is a wise man who does not grieve for the things which he has not, but rejoices for those which he has.', author: 'Epictetus' },
  { text: 'First, say to yourself what you would be; and then do what you have to do.', author: 'Epictetus' },
  { text: 'Seek not the good in external things; seek it in yourself.', author: 'Epictetus' },
  { text: 'Men are disturbed not by things, but by the opinions about things.', author: 'Epictetus' },
  { text: 'No great thing is created suddenly, any more than a bunch of grapes or a fig. If you tell me that you desire a fig, I answer you that there must be time. Let it first blossom, then bear fruit, then ripen.', author: 'Epictetus' },
  { text: 'Freedom is the only worthy goal in life. It is won by disregarding things that lie beyond our control.', author: 'Epictetus' },
  { text: 'If someone is able to show me that what I think or do is not right, I will happily change.', author: 'Marcus Aurelius' },
  { text: 'The obstacle is the path.', author: 'Zen Proverb (popularised by Marcus Aurelius)' },
];

/** Returns a consistent daily quote based on the current day of the year. */
export function getDailyQuote(): Quote {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return QUOTES[dayOfYear % QUOTES.length];
}
