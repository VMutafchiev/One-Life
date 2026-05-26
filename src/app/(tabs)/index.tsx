import { router } from 'expo-router';
import { useEffect, useMemo } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { LiveClock } from '@/components/LiveClock';
import { WeekGrid } from '@/components/WeekGrid';
import { getDailyQuote } from '@/lib/quotes';
import { useLifeStore } from '@/store/useLifeStore';

function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <View
      style={{
        backgroundColor: '#111',
        borderWidth: 0.5,
        borderColor: '#1e1e1e',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        alignItems: 'center',
        minWidth: 64,
      }}
    >
      <Text style={{ fontSize: 14, fontWeight: '500', color: '#f0f0f0' }}>
        {value}
      </Text>
      <Text style={{ fontSize: 9, color: '#444', marginTop: 2 }}>{label}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const daysRemaining = useLifeStore((s) => s.daysRemaining);
  const earnedMinutesToday = useLifeStore((s) => s.earnedMinutesToday);
  const streak = useLifeStore((s) => s.streak);
  const quizAnswers = useLifeStore((s) => s.quizAnswers);

  // Guard: redirect to onboarding if quiz was never completed.
  useEffect(() => {
    if (daysRemaining === 0) {
      router.replace('/onboarding');
    }
  }, [daysRemaining]);

  const age = quizAnswers.age ?? 30;
  const weeksLived = Math.round(age * 52);
  const yearsRemaining = daysRemaining / 365.25;
  const totalWeeks = Math.round((age + yearsRemaining) * 52);
  const lifeUsedPercent = totalWeeks > 0 ? Math.round((weeksLived / totalWeeks) * 100) : 0;

  const earnedHours = Math.floor(earnedMinutesToday / 60);
  const earnedMins = earnedMinutesToday % 60;
  const showEarned = earnedMinutesToday > 0;

  const quote = useMemo(() => getDailyQuote(), []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0c0c0c' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
      >
        {/* ── Top bar ── */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 24,
            paddingTop: 8,
            paddingBottom: 4,
          }}
        >
          <Text style={{ fontSize: 13, color: '#333', letterSpacing: 0.08 * 13 }}>
            one life
          </Text>

          <Text
            style={{
              fontSize: 12,
              color: streak > 0 ? '#d4537e' : '#333',
            }}
          >
            {streak > 0 ? `🔥 ${streak} day streak` : '🔥 0 day streak'}
          </Text>
        </View>

        {/* ── Clock section ── */}
        <View
          style={{
            alignItems: 'center',
            paddingVertical: 24,
            paddingHorizontal: 24,
          }}
        >
          <LiveClock baseDays={daysRemaining} earnedMinutes={earnedMinutesToday} />

          {showEarned && (
            <Text
              style={{
                fontSize: 12,
                color: '#1D9E75',
                marginTop: 10,
              }}
            >
              +{earnedHours > 0 ? `${earnedHours}h ` : ''}{earnedMins}m earned today
            </Text>
          )}
        </View>

        {/* ── Week grid section ── */}
        <View style={{ paddingHorizontal: 24 }}>
          <Text
            style={{
              fontSize: 10,
              color: '#333',
              letterSpacing: 0.1 * 10,
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            your life in weeks
          </Text>
          <WeekGrid weeksLived={weeksLived} totalWeeks={totalWeeks} />
        </View>

        {/* ── Share row ── */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 24,
            paddingVertical: 20,
          }}
        >
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <StatPill
              value={String(Math.round(yearsRemaining))}
              label="years left"
            />
            <StatPill
              value={`${lifeUsedPercent}%`}
              label="life used"
            />
            <StatPill
              value={String(age)}
              label="age"
            />
          </View>

          <Pressable
            onPress={() => {
              // @ts-expect-error — /share route is built in Prompt 5.
              router.push('/share');
            }}
            style={({ pressed }) => ({
              borderWidth: 0.5,
              borderColor: '#333',
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 6,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Text style={{ fontSize: 11, color: '#555' }}>Share grid ↗</Text>
          </Pressable>
        </View>

        {/* ── Daily quote ── */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <View
            style={{
              backgroundColor: '#111',
              borderWidth: 0.5,
              borderColor: '#1e1e1e',
              borderRadius: 12,
              padding: 16,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                color: '#555',
                fontStyle: 'italic',
                lineHeight: 13 * 1.6,
              }}
            >
              {quote.text}
            </Text>
            <Text
              style={{
                fontSize: 11,
                color: '#333',
                marginTop: 8,
              }}
            >
              — {quote.author}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
