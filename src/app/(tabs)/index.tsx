import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { MasterClock } from '@/components/MasterClock';
import { TimeGrid } from '@/components/TimeGrid';
import { WeekGrid } from '@/components/WeekGrid';
import { getDailyQuote } from '@/lib/quotes';
import {
  getLiveTimeUnits,
  getDayGridInfo,
  getHourOfDayGridInfo,
  getMinuteOfHourGridInfo,
  getSecondOfMinuteGridInfo,
  type TimeUnits,
} from '@/lib/timeCalc';
import { useLifeStore } from '@/store/useLifeStore';

// ── Sub-tab types ─────────────────────────────────────────────────────────────

type SubTab = 'overview' | 'weeks' | 'days' | 'hours' | 'minutes' | 'seconds';

const SUB_TABS: { key: SubTab; label: string }[] = [
  { key: 'overview',  label: 'Now'     },
  { key: 'weeks',     label: 'Weeks'   },
  { key: 'days',      label: 'Days'    },
  { key: 'hours',     label: 'Hours'   },
  { key: 'minutes',   label: 'Min'     },
  { key: 'seconds',   label: 'Sec'     },
];

// ── Sub-tab pill bar ──────────────────────────────────────────────────────────

function SubTabBar({
  active,
  onChange,
}: {
  active: SubTab;
  onChange: (t: SubTab) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 10,
        gap: 6,
      }}
    >
      {SUB_TABS.map(({ key, label }) => {
        const isActive = key === active;
        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 20,
              backgroundColor: isActive ? '#d4537e' : '#111',
              borderWidth: 0.5,
              borderColor: isActive ? '#d4537e' : '#222',
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: isActive ? '#fff' : '#555',
                fontWeight: isActive ? '600' : '400',
              }}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// ── Stat pill ─────────────────────────────────────────────────────────────────

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
      <Text style={{ fontSize: 14, fontWeight: '500', color: '#f0f0f0' }}>{value}</Text>
      <Text style={{ fontSize: 9, color: '#444', marginTop: 2 }}>{label}</Text>
    </View>
  );
}

// ── Grid sub-tab helper ───────────────────────────────────────────────────────

interface GridTabProps {
  units: TimeUnits;
  daysRemaining: number;
  quizAge: number;
  tab: SubTab;
}

function GridSubTab({ units, daysRemaining, quizAge, tab }: GridTabProps) {
  if (tab === 'weeks') {
    const weeksLived = Math.round(quizAge * 52);
    const yearsRemaining = daysRemaining / 365.25;
    const totalWeeks = Math.round((quizAge + yearsRemaining) * 52);
    return (
      <View style={{ paddingHorizontal: 24 }}>
        <Text style={sectionLabel}>your life in weeks</Text>
        <WeekGrid weeksLived={weeksLived} totalWeeks={totalWeeks} />
      </View>
    );
  }

  if (tab === 'days') {
    const info = getDayGridInfo(units);
    // Show last 365 days remaining for readability
    const displayTotal = Math.min(info.total, 365 * 5);
    const displayIndex = info.currentIndex < displayTotal ? info.currentIndex : displayTotal - 1;
    return (
      <View style={{ paddingHorizontal: 24 }}>
        <Text style={sectionLabel}>remaining days</Text>
        <TimeGrid
          total={displayTotal}
          currentIndex={displayIndex}
          progress={info.progress}
          accentColor="#d4537e"
          cols={30}
        />
        <Text style={gridCaption}>{Math.floor(units.days).toLocaleString()} days remaining</Text>
      </View>
    );
  }

  if (tab === 'hours') {
    const info = getHourOfDayGridInfo(units);
    return (
      <View style={{ paddingHorizontal: 24 }}>
        <Text style={sectionLabel}>hours today (0 – 23)</Text>
        <TimeGrid
          total={24}
          currentIndex={info.currentIndex}
          progress={info.progress}
          accentColor="#d4537e"
          countUp
          cols={6}
        />
        <Text style={gridCaption}>hour {info.currentIndex} of 24</Text>
      </View>
    );
  }

  if (tab === 'minutes') {
    const info = getMinuteOfHourGridInfo(units);
    return (
      <View style={{ paddingHorizontal: 24 }}>
        <Text style={sectionLabel}>minutes this hour (0 – 59)</Text>
        <TimeGrid
          total={60}
          currentIndex={info.currentIndex}
          progress={info.progress}
          accentColor="#d4537e"
          countUp
          cols={10}
        />
        <Text style={gridCaption}>minute {info.currentIndex} of 60</Text>
      </View>
    );
  }

  if (tab === 'seconds') {
    const info = getSecondOfMinuteGridInfo(units);
    return (
      <View style={{ paddingHorizontal: 24 }}>
        <Text style={sectionLabel}>seconds this minute (0 – 59)</Text>
        <TimeGrid
          total={60}
          currentIndex={info.currentIndex}
          progress={info.progress}
          accentColor="#d4537e"
          countUp
          cols={10}
        />
        <Text style={gridCaption}>second {info.currentIndex} of 60</Text>
      </View>
    );
  }

  return null;
}

const sectionLabel = {
  fontSize: 10,
  color: '#333',
  letterSpacing: 0.1 * 10,
  textTransform: 'uppercase' as const,
  marginBottom: 10,
};

const gridCaption = {
  fontSize: 10,
  color: '#333',
  marginTop: 8,
};

// ── Home screen ───────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const daysRemaining = useLifeStore((s) => s.daysRemaining);
  const earnedMinutesToday = useLifeStore((s) => s.earnedMinutesToday);
  const streak = useLifeStore((s) => s.streak);
  const quizAnswers = useLifeStore((s) => s.quizAnswers);

  const [activeTab, setActiveTab] = useState<SubTab>('overview');
  const [units, setUnits] = useState<TimeUnits>(() =>
    getLiveTimeUnits(daysRemaining, earnedMinutesToday),
  );

  // Guard: redirect to onboarding if quiz was never completed.
  useEffect(() => {
    if (daysRemaining === 0) {
      router.replace('/onboarding');
    }
  }, [daysRemaining]);

  // Live tick — 100ms for overview, 1s for grid tabs
  useEffect(() => {
    const interval = activeTab === 'overview' ? 100 : 1000;
    const id = setInterval(() => {
      setUnits(getLiveTimeUnits(daysRemaining, earnedMinutesToday));
    }, interval);
    return () => clearInterval(id);
  }, [activeTab, daysRemaining, earnedMinutesToday]);

  const age = quizAnswers.age ?? 30;
  const weeksLived = Math.round(age * 52);
  const yearsRemaining = units.years;
  const totalWeeks = Math.round((age + yearsRemaining) * 52);
  const lifeUsedPercent = totalWeeks > 0 ? Math.round((weeksLived / totalWeeks) * 100) : 0;

  const earnedHours = Math.floor(earnedMinutesToday / 60);
  const earnedMins = earnedMinutesToday % 60;
  const showEarned = earnedMinutesToday > 0;

  const quote = useMemo(() => getDailyQuote(), []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0c0c0c' }}>
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
        <Text style={{ fontSize: 12, color: streak > 0 ? '#d4537e' : '#333' }}>
          {streak > 0 ? `🔥 ${streak} day streak` : '🔥 0 day streak'}
        </Text>
      </View>

      {/* ── Sub-tab bar ── */}
      <SubTabBar active={activeTab} onChange={setActiveTab} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
      >
        {activeTab === 'overview' ? (
          <>
            {/* ── Master clock (all 7 units) ── */}
            <MasterClock daysRemaining={daysRemaining} earnedMinutes={earnedMinutesToday} />

            {showEarned && (
              <Text
                style={{
                  fontSize: 12,
                  color: '#1D9E75',
                  textAlign: 'center',
                  marginTop: 8,
                  marginBottom: 4,
                }}
              >
                +{earnedHours > 0 ? `${earnedHours}h ` : ''}{earnedMins}m earned today
              </Text>
            )}

            {/* ── Stat pills row ── */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 24,
                paddingVertical: 16,
              }}
            >
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <StatPill value={String(Math.round(yearsRemaining))} label="years left" />
                <StatPill value={`${lifeUsedPercent}%`} label="life used" />
                <StatPill value={String(age)} label="age" />
              </View>

              <Pressable
                onPress={() => {
                  // @ts-expect-error — /share route built in a later prompt
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
                <Text style={{ fontSize: 11, color: '#555' }}>Share ↗</Text>
              </Pressable>
            </View>

            {/* ── Week grid preview ── */}
            <View style={{ paddingHorizontal: 24, marginBottom: 20 }}>
              <Text style={sectionLabel}>your life in weeks</Text>
              <WeekGrid weeksLived={weeksLived} totalWeeks={totalWeeks} />
            </View>

            {/* ── Daily quote ── */}
            <View style={{ paddingHorizontal: 24 }}>
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
                <Text style={{ fontSize: 11, color: '#333', marginTop: 8 }}>
                  — {quote.author}
                </Text>
              </View>
            </View>
          </>
        ) : (
          <View style={{ paddingTop: 8 }}>
            <GridSubTab
              units={units}
              daysRemaining={daysRemaining}
              quizAge={age}
              tab={activeTab}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
