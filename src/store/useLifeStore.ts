import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { QuizAnswers } from '@/lib/lifeCalc';

interface LifeState {
  daysRemaining: number;
  quizAnswers: Partial<QuizAnswers>;
  earnedMinutesToday: number;
  streak: number;
  lastLoggedDate: string | null;
  isPro: boolean;
  hasCompletedQuiz: boolean;
}

interface LifeActions {
  /** Overwrites the calculated days remaining on the clock. */
  setDaysRemaining: (days: number) => void;
  /** Merges new quiz answers into the stored answers object. */
  setQuizAnswers: (answers: Partial<QuizAnswers>) => void;
  /** Adds earned minutes from a logged habit, respecting the daily cap externally. */
  addEarnedMinutes: (minutes: number) => void;
  /** Increments the streak counter and records today's date. */
  incrementStreak: () => void;
  /** Resets today's earned minutes to zero (called at midnight). */
  resetDailyEarned: () => void;
  /** Sets the user's Pro subscription status. */
  setIsPro: (isPro: boolean) => void;
  /** Marks onboarding as complete after the quiz is finished. */
  setHasCompletedQuiz: (done: boolean) => void;
}

export const useLifeStore = create<LifeState & LifeActions>()(
  persist(
    (set) => ({
      daysRemaining: 0,
      quizAnswers: {},
      earnedMinutesToday: 0,
      streak: 0,
      lastLoggedDate: null,
      isPro: false,
      hasCompletedQuiz: false,

      setDaysRemaining: (days) => set({ daysRemaining: days }),

      setQuizAnswers: (answers) =>
        set((state) => ({ quizAnswers: { ...state.quizAnswers, ...answers } })),

      addEarnedMinutes: (minutes) =>
        set((state) => ({ earnedMinutesToday: state.earnedMinutesToday + minutes })),

      incrementStreak: () =>
        set((state) => ({
          streak: state.streak + 1,
          lastLoggedDate: new Date().toISOString(),
        })),

      resetDailyEarned: () => set({ earnedMinutesToday: 0 }),

      setIsPro: (isPro) => set({ isPro }),

      setHasCompletedQuiz: (done) => set({ hasCompletedQuiz: done }),
    }),
    {
      name: 'one-life-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
